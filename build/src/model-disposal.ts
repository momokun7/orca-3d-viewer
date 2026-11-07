import { type BufferGeometry, type Material, type Object3D, Skeleton, Texture } from 'three'

type Disposable = { dispose: () => void }
type Renderable = Object3D & { geometry?: BufferGeometry; material?: Material | Material[]; skeleton?: unknown }

function materials(object: Renderable): Material[] {
  if (!object.material) return []
  return Array.isArray(object.material) ? object.material : [object.material]
}

function texturesOf(material: Material): Texture[] {
  return Object.values(material).filter((value): value is Texture => value instanceof Texture)
}

/**
 * Releases everything a loaded glTF holds on the GPU and in decoded images: geometries of every
 * drawable kind (meshes, points, lines), materials, textures and the ImageBitmaps behind them, which
 * three.js never closes, skin bone textures and instance buffers. Shared resources are released once.
 */
export function disposeObjectTree(root: Object3D, keep: ReadonlySet<object> = new Set()): void {
  const released = new Set<Disposable>(keep as ReadonlySet<Disposable>)
  const release = (resource: Disposable | null | undefined): void => {
    if (!resource || released.has(resource)) return
    released.add(resource)
    resource.dispose()
  }
  root.traverse((node) => {
    const object = node as Renderable
    release(object.geometry)
    for (const material of materials(object)) {
      for (const texture of texturesOf(material)) {
        if (!released.has(texture) && !keep.has(texture.image as object) && typeof ImageBitmap !== 'undefined' && texture.image instanceof ImageBitmap) {
          texture.image.close()
        }
        release(texture)
      }
      release(material)
    }
    if (object.skeleton instanceof Skeleton) release(object.skeleton)
    // Why only instanced meshes: their dispose() frees instance buffers, while a plain Object3D has none.
    if ('isInstancedMesh' in object && object.isInstancedMesh) release(object as unknown as Disposable)
  })
}

/** Everything under `root` that disposeObjectTree would release: to keep it while releasing another tree. */
export function resourcesOf(root: Object3D): Set<object> {
  const resources = new Set<object>()
  root.traverse((node) => {
    const object = node as Renderable
    if (object.geometry) resources.add(object.geometry)
    for (const material of materials(object)) {
      resources.add(material)
      for (const texture of texturesOf(material)) {
        resources.add(texture)
        if (texture.image) resources.add(texture.image as object)
      }
    }
    if (object.skeleton instanceof Skeleton) resources.add(object.skeleton)
  })
  return resources
}
