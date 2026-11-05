import {
  Box3,
  DirectionalLight,
  HemisphereLight,
  type BufferGeometry,
  type Light,
  type Material,
  type Mesh,
  NeutralToneMapping,
  type Object3D,
  PerspectiveCamera,
  PMREMGenerator,
  Scene,
  type SkinnedMesh,
  SRGBColorSpace,
  Texture,
  Timer,
  Vector3,
  WebGLRenderer
} from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import type { GltfModel } from './gltf-model-parse.ts'
import { disposeObjectTree } from './model-disposal.ts'
import { measureModel, type ModelStats } from './model-stats.ts'
import { createSceneAnimation, type SceneAnimation } from './scene-animation.ts'
import { createSceneGuides, type ModelDimensions, type SceneGuides } from './scene-guides.ts'

export type ModelSummary = {
  stats: ModelStats
  dimensions: ModelDimensions
  gridCellSize: number
  animationNames: string[]
  otherSceneCount: number
}

export type ModelStage = {
  /** The renderer KTX2 textures are transcoded for. */
  renderer: WebGLRenderer
  /**
   * Shows `model` in place of the current one once its shaders are compiled; keeps the camera when
   * `keepView` and the bounds are alike. On failure the current model stays and `model` is released.
   */
  show: (model: GltfModel, keepView: boolean) => Promise<ModelSummary>
  /** Removes and releases the current model. */
  clear: () => void
  resetView: () => void
  setWireframe: (enabled: boolean) => void
  setGuidesVisible: (visible: boolean) => void
  playAnimation: (clipIndex: number) => void
  setAnimationPaused: (paused: boolean) => void
  dispose: () => void
}

export type StageEvents = {
  onContextLost: () => void
  onContextRestored: () => void
}

// Why cap: past 2, each step multiplies the pixels shaded for little visible gain.
export const MAX_PIXEL_RATIO = 2
// Up to this much vertex work (morph targets count once each) the bounds follow the vertices, so
// rotated parts are not overstated; past it, each geometry's own box is transformed instead.
export const PRECISE_BOUNDS_WORK = 2_000_000
// Shaders still compiling by then are compiled by the first frame instead.
const COMPILE_WAIT_MS = 10_000
const MAX_ANISOTROPY = 8
const DEFAULT_LIGHT_INTENSITIES = { hemisphere: 0.6, key: 1.2 }

type Shown = {
  model: Object3D
  guides: SceneGuides
  animation: SceneAnimation
  center: Vector3
  radius: number
  materials: Material[]
}

/** Vertices the precise bounds would visit, each morph target counting as another pass. */
function boundsWork(root: Object3D): number {
  let work = 0
  root.traverse((node) => {
    const geometry = (node as Mesh).geometry as BufferGeometry | undefined
    const vertices = geometry?.getAttribute('position')?.count ?? 0
    work += vertices * (1 + (geometry?.morphAttributes.position?.length ?? 0))
  })
  return work
}

/** The model's bounds, and whether it has any geometry at all. */
function boundsOf(model: Object3D): { bounds: Box3; empty: boolean } {
  model.updateMatrixWorld(true)
  const bounds = new Box3().setFromObject(model, boundsWork(model) <= PRECISE_BOUNDS_WORK)
  // Why: a model with no geometry (only empty nodes or lights) has empty bounds.
  return bounds.isEmpty()
    ? { bounds: new Box3(new Vector3(-0.5, -0.5, -0.5), new Vector3(0.5, 0.5, 0.5)), empty: true }
    : { bounds, empty: false }
}

function collectMaterials(root: Object3D): Material[] {
  const materials = new Set<Material>()
  root.traverse((node) => {
    const material = (node as Object3D & { material?: Material | Material[] }).material
    for (const entry of Array.isArray(material) ? material : material ? [material] : []) materials.add(entry)
  })
  return [...materials]
}

function hasOwnLights(root: Object3D): boolean {
  let found = false
  root.traverse((node) => {
    if ((node as Light).isLight) found = true
  })
  return found
}

function prepareForDisplay(root: Object3D, anisotropy: number): void {
  root.traverse((node) => {
    // Why from the data: GLTFLoader takes these boxes from the file's min and max, which it never checks,
    // and they decide what is culled.
    const geometry = (node as Mesh).geometry as BufferGeometry | undefined
    if (geometry?.getAttribute('position')) {
      geometry.computeBoundingBox()
      geometry.computeBoundingSphere()
    }
    // Why: a skinned mesh's bounds follow its bind pose, so animated limbs would be culled at the edges.
    if ((node as SkinnedMesh).isSkinnedMesh) node.frustumCulled = false
  })
  for (const material of collectMaterials(root)) {
    for (const value of Object.values(material)) {
      if (value instanceof Texture) value.anisotropy = anisotropy
    }
  }
}

/**
 * One renderer, environment and camera for the life of the frame: a document change swaps the model
 * only, so reloads never pile up WebGL contexts (Chromium evicts the oldest past 16 per process).
 */
export function createModelStage(host: HTMLElement, events: StageEvents): ModelStage {
  const renderer = new WebGLRenderer({ antialias: true, alpha: true })
  const canvas = renderer.domElement
  renderer.outputColorSpace = SRGBColorSpace
  renderer.toneMapping = NeutralToneMapping
  canvas.style.display = 'block'
  canvas.tabIndex = 0
  host.appendChild(canvas)
  const anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), MAX_ANISOTROPY)

  const scene = new Scene()
  const hemisphere = new HemisphereLight(0xffffff, 0x444444, DEFAULT_LIGHT_INTENSITIES.hemisphere)
  const keyLight = new DirectionalLight(0xffffff, DEFAULT_LIGHT_INTENSITIES.key)
  keyLight.position.set(1, 2, 1.5)
  scene.add(hemisphere, keyLight)

  let environment: Texture | null = null
  const buildEnvironment = (): void => {
    environment?.dispose()
    const pmrem = new PMREMGenerator(renderer)
    const room = new RoomEnvironment()
    environment = pmrem.fromScene(room, 0.04).texture
    room.dispose()
    pmrem.dispose()
    scene.environment = environment
  }
  buildEnvironment()

  const camera = new PerspectiveCamera(45, 1, 0.01, 1000)
  const controls = new OrbitControls(camera, canvas)
  controls.listenToKeyEvents(canvas)
  let shown: Shown | null = null
  let contextLost = false
  let onScreen = true

  const render = (): void => {
    if (!contextLost && onScreen) renderer.render(scene, camera)
  }
  // Why from the model's centre, not the orbit target: panning away from the model must not clip it.
  const updateClipping = (): void => {
    const center = shown?.center ?? controls.target
    const radius = shown?.radius ?? 1
    const distance = camera.position.distanceTo(center)
    camera.far = distance + radius * 4
    // Why the floor at far / 1e4: a 24-bit depth buffer cannot separate surfaces past that ratio.
    camera.near = Math.max(distance - radius * 4, camera.far / 1e4, 1e-6)
    camera.updateProjectionMatrix()
  }
  controls.addEventListener('change', () => {
    updateClipping()
    render()
  })

  const timer = new Timer()
  const running = (): boolean =>
    shown !== null && !contextLost && onScreen && !document.hidden && shown.animation.isRunning()
  const loop = (): void => {
    if (!running()) {
      renderer.setAnimationLoop(null)
      return
    }
    timer.update()
    shown!.animation.update(timer.getDelta())
    render()
  }
  const startLoop = (): void => {
    if (running()) {
      timer.reset()
      renderer.setAnimationLoop(loop)
    }
  }
  const onVisibilityChange = (): void => {
    if (!document.hidden) startLoop()
  }
  document.addEventListener('visibilitychange', onVisibilityChange)
  // Why also an intersection check: a tab Orca hides with CSS still reports the document as visible.
  const visibility = new IntersectionObserver(([entry]) => {
    onScreen = entry?.isIntersecting ?? true
    if (onScreen) {
      render()
      startLoop()
    }
  })
  visibility.observe(host)

  const resize = (): void => {
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, MAX_PIXEL_RATIO))
    const width = Math.max(host.clientWidth, 1)
    const height = Math.max(host.clientHeight, 1)
    renderer.setSize(width, height)
    camera.aspect = width / height
    camera.updateProjectionMatrix()
    render()
  }
  const observer = new ResizeObserver(resize)
  observer.observe(host)
  // Why: moving the window to a screen with another pixel ratio changes no size the observer sees.
  let pixelRatioQuery: MediaQueryList | null = null
  const watchPixelRatio = (): void => {
    pixelRatioQuery?.removeEventListener('change', watchPixelRatio)
    pixelRatioQuery = window.matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`)
    pixelRatioQuery.addEventListener('change', watchPixelRatio, { once: true })
    resize()
  }
  watchPixelRatio()

  const onContextLost = (event: Event): void => {
    // Why preventDefault: it asks the browser to restore the context rather than leave it dead.
    event.preventDefault()
    contextLost = true
    renderer.setAnimationLoop(null)
    events.onContextLost()
  }
  const onContextRestored = (): void => {
    contextLost = false
    // Why only the environment: three re-uploads geometry and textures, but render targets are lost.
    buildEnvironment()
    render()
    startLoop()
    events.onContextRestored()
  }
  canvas.addEventListener('webglcontextlost', onContextLost)
  canvas.addEventListener('webglcontextrestored', onContextRestored)

  const frame = (center: Vector3, radius: number): void => {
    const distance = radius / Math.sin((camera.fov * Math.PI) / 360)
    camera.position.copy(center).add(new Vector3(0.6, 0.4, 1).normalize().multiplyScalar(distance))
    controls.target.copy(center)
    controls.minDistance = radius * 1e-3
    controls.maxDistance = radius * 100
    controls.update()
  }

  const release = (entry: Shown): void => {
    entry.animation.dispose()
    scene.remove(entry.model, entry.guides.group)
    disposeObjectTree(entry.model)
    entry.guides.dispose()
  }

  const clear = (): void => {
    if (!shown) return
    renderer.setAnimationLoop(null)
    release(shown)
    shown = null
    render()
  }

  return {
    renderer,
    show: async (model, keepView) => {
      let guides: SceneGuides | null = null
      let animation: SceneAnimation | null = null
      let next: Shown
      let summary: ModelSummary
      try {
        const stats = measureModel(model.scene)
        prepareForDisplay(model.scene, anisotropy)
        const { bounds, empty } = boundsOf(model.scene)
        const center = bounds.getCenter(new Vector3())
        const radius = Math.max(bounds.getSize(new Vector3()).length() / 2, 1e-6)
        guides = createSceneGuides(bounds)
        animation = createSceneAnimation(model.scene, model.animations)
        next = { model: model.scene, guides, animation, center, radius, materials: collectMaterials(model.scene) }
        // Why compile first: programs for heavy materials otherwise compile inside the first frame.
        // Without parallel compilation (software GL) compileAsync only warns, so compile directly; with
        // a lost context it would wait for a restore that may never come, so the wait is bounded.
        if (!contextLost && renderer.extensions.has('KHR_parallel_shader_compile')) {
          await Promise.race([renderer.compileAsync(model.scene, camera, scene), new Promise((done) => setTimeout(done, COMPILE_WAIT_MS))])
        } else if (!contextLost) {
          renderer.compile(model.scene, camera, scene)
        }
        summary = {
          stats,
          dimensions: empty ? { width: 0, height: 0, depth: 0 } : guides.dimensions,
          gridCellSize: guides.gridCellSize,
          animationNames: animation.clipNames,
          otherSceneCount: model.otherSceneCount
        }
      } catch (error) {
        animation?.dispose()
        guides?.dispose()
        disposeObjectTree(model.scene)
        throw error
      }

      const previous = shown
      const alike =
        previous !== null &&
        previous.center.distanceTo(next.center) < Math.max(previous.radius, next.radius) * 0.5 &&
        next.radius / previous.radius > 0.5 &&
        next.radius / previous.radius < 2
      const ownLights = hasOwnLights(model.scene)
      hemisphere.intensity = ownLights ? DEFAULT_LIGHT_INTENSITIES.hemisphere * 0.25 : DEFAULT_LIGHT_INTENSITIES.hemisphere
      keyLight.visible = !ownLights
      clear()
      shown = next
      scene.add(next.model, next.guides.group)
      if (!(keepView && alike)) frame(next.center, next.radius)
      updateClipping()
      render()
      return summary
    },
    clear,
    resetView: () => {
      if (shown) frame(shown.center, shown.radius)
      updateClipping()
      render()
    },
    setWireframe: (enabled) => {
      for (const material of shown?.materials ?? []) {
        if ('wireframe' in material) material.wireframe = enabled
      }
      render()
    },
    setGuidesVisible: (visible) => {
      if (shown) shown.guides.group.visible = visible
      render()
    },
    playAnimation: (clipIndex) => {
      shown?.animation.play(clipIndex)
      render()
      startLoop()
    },
    setAnimationPaused: (paused) => {
      shown?.animation.setPaused(paused)
      if (paused) renderer.setAnimationLoop(null)
      else startLoop()
      render()
    },
    dispose: () => {
      clear()
      document.removeEventListener('visibilitychange', onVisibilityChange)
      pixelRatioQuery?.removeEventListener('change', watchPixelRatio)
      visibility.disconnect()
      observer.disconnect()
      canvas.removeEventListener('webglcontextlost', onContextLost)
      canvas.removeEventListener('webglcontextrestored', onContextRestored)
      controls.dispose()
      environment?.dispose()
      renderer.dispose()
      renderer.forceContextLoss()
      canvas.remove()
    }
  }
}
