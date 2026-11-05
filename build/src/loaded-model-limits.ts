// Measures what three.js actually built, before it is shown. The budget predicts this from the JSON;
// this counts the result, so a way of multiplying memory or work that the budget does not know about
// still cannot reach the screen.
import type { AnimationClip, BufferAttribute, BufferGeometry, InterleavedBufferAttribute, Light, Object3D } from 'three'
import { BUDGET } from './gltf-budget.ts'

export const LOADED_LIMITS = {
  lights: 64,
  tracks: BUDGET.animationTracks,
  geometryBytes: BUDGET.geometryBytes,
  drawnVertices: BUDGET.drawnVertices,
  objects: BUDGET.nodes * 4
} as const

export type LoadedExcess = { what: 'lights' | 'tracks' | 'geometryBytes' | 'drawnVertices' | 'objects'; value: number; limit: number }

type Drawable = Object3D & {
  geometry?: BufferGeometry
  isInstancedMesh?: boolean
  count?: number
  morphTargetInfluences?: number[]
}

function attributeBytes(attribute: BufferAttribute | InterleavedBufferAttribute, counted: Set<ArrayBufferLike>): number {
  const array = 'data' in attribute && attribute.data ? attribute.data.array : (attribute as BufferAttribute).array
  if (counted.has(array.buffer)) return 0
  counted.add(array.buffer)
  return array.buffer.byteLength
}

/** The first limit the built model exceeds, or null. */
export function loadedModelExcess(root: Object3D, animations: AnimationClip[]): LoadedExcess | null {
  let lights = 0
  let objects = 0
  let bytes = 0
  let drawn = 0
  const geometries = new Set<BufferGeometry>()
  const buffers = new Set<ArrayBufferLike>()
  root.traverse((node) => {
    objects++
    if ((node as Light).isLight) lights++
    const object = node as Drawable
    const geometry = object.geometry
    if (!geometry) return
    const instances = object.isInstancedMesh ? (object.count ?? 1) : 1
    const elements = geometry.index?.count ?? geometry.getAttribute('position')?.count ?? 0
    drawn += elements * instances * (1 + (geometry.morphAttributes.position?.length ?? 0))
    if (geometries.has(geometry)) return
    geometries.add(geometry)
    if (geometry.index) bytes += attributeBytes(geometry.index, buffers)
    for (const attribute of Object.values(geometry.attributes)) bytes += attributeBytes(attribute, buffers)
    for (const targets of Object.values(geometry.morphAttributes)) {
      for (const attribute of targets) bytes += attributeBytes(attribute, buffers)
    }
  })
  const tracks = animations.reduce((sum, clip) => sum + clip.tracks.length, 0)
  if (lights > LOADED_LIMITS.lights) return { what: 'lights', value: lights, limit: LOADED_LIMITS.lights }
  if (objects > LOADED_LIMITS.objects) return { what: 'objects', value: objects, limit: LOADED_LIMITS.objects }
  if (tracks > LOADED_LIMITS.tracks) return { what: 'tracks', value: tracks, limit: LOADED_LIMITS.tracks }
  if (bytes > LOADED_LIMITS.geometryBytes) return { what: 'geometryBytes', value: bytes, limit: LOADED_LIMITS.geometryBytes }
  if (drawn > LOADED_LIMITS.drawnVertices) return { what: 'drawnVertices', value: drawn, limit: LOADED_LIMITS.drawnVertices }
  return null
}
