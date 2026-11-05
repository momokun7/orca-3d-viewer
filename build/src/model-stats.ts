import type { BufferGeometry, Object3D } from 'three'

export type ModelStats = {
  vertices: number
  triangles: number
  points: number
  lineSegments: number
  drawCalls: number
}

type Drawable = Object3D & {
  geometry?: BufferGeometry
  isMesh?: boolean
  isPoints?: boolean
  isLine?: boolean
  isLineSegments?: boolean
  isLineLoop?: boolean
  isInstancedMesh?: boolean
  count?: number
}

function drawnCount(geometry: BufferGeometry): number {
  const position = geometry.getAttribute('position')
  const available = geometry.index?.count ?? position?.count ?? 0
  return Math.min(available, Number.isFinite(geometry.drawRange.count) ? geometry.drawRange.count : available)
}

/** What the model draws: triangles for meshes, points and line segments for the rest, per instance. */
export function measureModel(root: Object3D): ModelStats {
  const stats: ModelStats = { vertices: 0, triangles: 0, points: 0, lineSegments: 0, drawCalls: 0 }
  root.traverse((node) => {
    const object = node as Drawable
    if (!object.geometry) return
    const instances = object.isInstancedMesh ? (object.count ?? 1) : 1
    const elements = drawnCount(object.geometry)
    stats.vertices += (object.geometry.getAttribute('position')?.count ?? 0) * instances
    stats.drawCalls += 1
    if (object.isMesh) {
      stats.triangles += Math.floor(elements / 3) * instances
    } else if (object.isPoints) {
      stats.points += elements * instances
    } else if (object.isLineSegments) {
      stats.lineSegments += Math.floor(elements / 2) * instances
    } else if (object.isLineLoop) {
      stats.lineSegments += elements * instances
    } else if (object.isLine) {
      stats.lineSegments += Math.max(0, elements - 1) * instances
    }
  })
  return stats
}
