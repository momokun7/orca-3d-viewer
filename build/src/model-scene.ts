import {
  Box3,
  DirectionalLight,
  HemisphereLight,
  type Light,
  type Material,
  NeutralToneMapping,
  type Object3D,
  PerspectiveCamera,
  PMREMGenerator,
  Scene,
  SRGBColorSpace,
  type Texture,
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
  /** Shows `model` in place of the current one; keeps the camera when `keepView` and the bounds are alike. */
  show: (model: GltfModel, keepView: boolean) => ModelSummary
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
const DEFAULT_LIGHT_INTENSITIES = { hemisphere: 0.6, key: 1.2 }

type Shown = {
  model: Object3D
  guides: SceneGuides
  animation: SceneAnimation
  center: Vector3
  radius: number
  materials: Material[]
}

function boundsOf(model: Object3D): Box3 {
  model.updateMatrixWorld(true)
  const bounds = new Box3().setFromObject(model)
  // Why: a model with no geometry (only empty nodes or lights) has empty bounds.
  return bounds.isEmpty() ? new Box3(new Vector3(-0.5, -0.5, -0.5), new Vector3(0.5, 0.5, 0.5)) : bounds
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

  const render = (): void => {
    if (!contextLost) renderer.render(scene, camera)
  }
  // Why per change: fixed near/far set at reset clip the model when zooming far in or out.
  const updateClipping = (): void => {
    const radius = shown?.radius ?? 1
    const distance = camera.position.distanceTo(controls.target)
    camera.near = Math.max(distance / 1000, (distance - radius * 4) * 0.5, 1e-6)
    camera.far = distance + radius * 8
    camera.updateProjectionMatrix()
  }
  controls.addEventListener('change', () => {
    updateClipping()
    render()
  })

  const timer = new Timer()
  const loop = (): void => {
    if (!shown || contextLost || document.hidden || !shown.animation.isRunning()) {
      renderer.setAnimationLoop(null)
      return
    }
    timer.update()
    shown.animation.update(timer.getDelta())
    render()
  }
  const startLoop = (): void => {
    if (shown?.animation.isRunning() && !contextLost && !document.hidden) {
      timer.reset()
      renderer.setAnimationLoop(loop)
    }
  }
  const onVisibilityChange = (): void => {
    if (!document.hidden) startLoop()
  }
  document.addEventListener('visibilitychange', onVisibilityChange)

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
    updateClipping()
  }

  const clear = (): void => {
    if (!shown) return
    renderer.setAnimationLoop(null)
    shown.animation.dispose()
    scene.remove(shown.model, shown.guides.group)
    disposeObjectTree(shown.model)
    shown.guides.dispose()
    shown = null
    render()
  }

  return {
    show: (model, keepView) => {
      const previous = shown
      const bounds = boundsOf(model.scene)
      const center = bounds.getCenter(new Vector3())
      const radius = Math.max(bounds.getSize(new Vector3()).length() / 2, 1e-6)
      const guides = createSceneGuides(bounds)
      const ownLights = hasOwnLights(model.scene)
      hemisphere.intensity = ownLights ? DEFAULT_LIGHT_INTENSITIES.hemisphere * 0.25 : DEFAULT_LIGHT_INTENSITIES.hemisphere
      keyLight.visible = !ownLights
      const alike =
        previous !== null &&
        previous.center.distanceTo(center) < Math.max(previous.radius, radius) * 0.5 &&
        radius / previous.radius > 0.5 &&
        radius / previous.radius < 2
      clear()
      const animation = createSceneAnimation(model.scene, model.animations)
      shown = { model: model.scene, guides, animation, center, radius, materials: collectMaterials(model.scene) }
      scene.add(model.scene, guides.group)
      if (!(keepView && alike)) frame(center, radius)
      updateClipping()
      render()
      return {
        stats: measureModel(model.scene),
        dimensions: guides.dimensions,
        gridCellSize: guides.gridCellSize,
        animationNames: animation.clipNames,
        otherSceneCount: model.otherSceneCount
      }
    },
    clear,
    resetView: () => {
      if (shown) frame(shown.center, shown.radius)
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
