// Builds a scene from STL, PLY, OBJ and FBX files, which their checks have already let through.
// These loaders parse synchronously, so the checks bound what they build; the result goes through
// the same loaded-model limits as glTF before it is shown.
import {
  BufferGeometry,
  Float32BufferAttribute,
  Group,
  LoadingManager,
  Mesh,
  type Material,
  MeshStandardMaterial,
  type Object3D
} from 'three'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js'
import { PLYLoader } from 'three/examples/jsm/loaders/PLYLoader.js'
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js'
import { BLOCKED_RESOURCE_URL, type GltfModel, resolveOwnUrl, trackBlobUrls } from './gltf-model-parse.ts'
import { stlIsText } from './mesh-budget.ts'
import { latin1, type MeshFormat } from './model-format.ts'

export type MeshModel = GltfModel & {
  /** Files the model names beside itself, which the frame cannot read: textures it shows blank. */
  blockedFiles: string[]
}

// A muted blue: untextured scans and prints read as a shape on both themes, not as white on white.
const SURFACE_COLOR = 0x4d617a
// Meters per unit for formats that store no unit: STL is millimetres by convention.
export const ASSUMED_METERS_PER_UNIT: Record<'stl' | 'ply' | 'obj', number> = { stl: 0.001, ply: 1, obj: 1 }

function surface(geometry: BufferGeometry): MeshStandardMaterial {
  return new MeshStandardMaterial({
    color: SURFACE_COLOR,
    roughness: 0.6,
    metalness: 0,
    vertexColors: geometry.hasAttribute('color')
  })
}

function meshOf(geometry: BufferGeometry): Mesh {
  if (!geometry.hasAttribute('normal')) geometry.computeVertexNormals()
  return new Mesh(geometry, surface(geometry))
}

/** Gives every mesh of an OBJ the viewer's surface: its own materials live in .mtl files it cannot read. */
function resurface(root: Object3D): void {
  root.traverse((node) => {
    const mesh = node as Mesh
    if (!mesh.isMesh) return
    if (!mesh.geometry.hasAttribute('normal')) mesh.geometry.computeVertexNormals()
    const old: Material[] = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
    for (const material of old) material.dispose()
    mesh.material = surface(mesh.geometry)
  })
}

/**
 * Reads a text STL in one pass over its words. STLLoader matches it with regular expressions that
 * backtrack for minutes on crafted runs of spaces or of unclosed "solid" and "facet" blocks.
 */
export function textStlGeometry(text: string): BufferGeometry {
  const positions: number[] = []
  const words = text.matchAll(/\S+/g)
  for (const { 0: word } of words) {
    if (word !== 'vertex') continue
    for (let axis = 0; axis < 3; axis++) positions.push(Number.parseFloat(words.next().value?.[0] ?? '') || 0)
  }
  const geometry = new BufferGeometry()
  geometry.setAttribute('position', new Float32BufferAttribute(positions.slice(0, positions.length - (positions.length % 9)), 3))
  return geometry
}

function scaled(content: Object3D, metersPerUnit: number, zUp = false): Group {
  const root = new Group()
  root.scale.setScalar(metersPerUnit)
  // Why: STL comes from CAD and slicers, where Z is up; the viewer stands models on Y.
  if (zUp) root.rotation.x = -Math.PI / 2
  root.add(content)
  return root
}

export function parseMeshModel(format: MeshFormat, data: ArrayBuffer | string, metersPerUnit: number): MeshModel {
  const blockedFiles: string[] = []
  const manager = new LoadingManager()
  manager.setURLModifier((url) => {
    const resolved = resolveOwnUrl(url)
    if (resolved === BLOCKED_RESOURCE_URL) blockedFiles.push(url.split(/[\\/]/).at(-1) ?? url)
    return resolved
  })
  const text = (): string => (typeof data === 'string' ? data : new TextDecoder().decode(data))
  const bytes = (): ArrayBuffer => (typeof data === 'string' ? new TextEncoder().encode(data).buffer : data)
  switch (format) {
    case 'stl':
    {
      const stl = bytes()
      const geometry = stlIsText(stl) ? textStlGeometry(latin1(new Uint8Array(stl))) : new STLLoader(manager).parse(stl)
      return { scene: scaled(meshOf(geometry), metersPerUnit, true), animations: [], otherSceneCount: 0, blockedFiles }
    }
    case 'ply':
      return { scene: scaled(meshOf(new PLYLoader(manager).parse(bytes())), metersPerUnit), animations: [], otherSceneCount: 0, blockedFiles }
    case 'obj': {
      const group = new OBJLoader(manager).parse(text())
      resurface(group)
      return { scene: scaled(group, metersPerUnit), animations: [], otherSceneCount: 0, blockedFiles }
    }
    case 'fbx': {
      const untrack = trackBlobUrls()
      try {
        const group = new FBXLoader(manager).parse(bytes(), '')
        return { scene: scaled(group, metersPerUnit), animations: group.animations, otherSceneCount: 0, blockedFiles }
      } finally {
        untrack()
      }
    }
  }
}
