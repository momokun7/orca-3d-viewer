// Refuses a model before three.js allocates for it when its JSON declares more than the viewer can
// hold. Runs after validateGltfStructure, so every index, enum and count here is known to be valid.
// It counts what three.js will allocate, not what the file stores: zero-filled sparse accessors,
// Meshopt and Draco decoded sizes (Draco's from its own header, since the decoder ignores the JSON),
// morph target textures, one GPU texture per image and sampler pair, and skin joints.
import { type BufferSources, bufferSources } from './byte-sources.ts'
import { dracoSize } from './draco-header.ts'
import { GLTF_MESHOPT_EXTENSIONS, type GltfDocument, isRecord } from './gltf-document-inspection.ts'
import { COMPONENT_BYTES, TYPE_COMPONENTS } from './gltf-validation.ts'
import { imageSize } from './image-dimensions.ts'

export const BUDGET = {
  /** Decoded vertex, index and animation data on the CPU side. */
  geometryBytes: 512 * 1024 * 1024,
  /** Textures (with mipmaps) and morph target data on the GPU. */
  gpuBytes: 1024 * 1024 * 1024,
  nodes: 100_000,
  drawCalls: 50_000,
  images: 1024,
  textures: 4096,
  imageSide: 16_384,
  skinJoints: 65_536,
  jointsPerSkin: 4096
} as const

export type BudgetExcess =
  | {
      kind: 'geometryBytes' | 'gpuBytes' | 'nodes' | 'drawCalls' | 'images' | 'textures' | 'skinJoints'
      value: number
      limit: number
    }
  | { kind: 'imageSide'; value: number; limit: number; width: number; height: number }
  | { kind: 'unreadableImage'; index: number }
  | { kind: 'unreadableDraco'; mesh: number }

type Records = Record<string, unknown>[]
const list = (document: GltfDocument, key: string): Records => (Array.isArray(document[key]) ? (document[key] as Records) : [])

// Why 4/3: a full mipmap chain adds a third to the base level.
const MIPMAPPED = 4 / 3
const RGBA_BYTES = 4
const MORPH_TEXEL_BYTES = 16

function elementBytes(accessor: Record<string, unknown>): number {
  return COMPONENT_BYTES.get(accessor.componentType as number)! * TYPE_COMPONENTS.get(accessor.type as string)!
}

function geometryBytes(document: GltfDocument, sources: BufferSources): BudgetExcess | number {
  const accessors = list(document, 'accessors')
  let total = 0
  for (const accessor of accessors) total += (accessor.count as number) * elementBytes(accessor)
  for (const view of list(document, 'bufferViews')) {
    const extensions = isRecord(view.extensions) ? view.extensions : {}
    if (GLTF_MESHOPT_EXTENSIONS.some((name) => extensions[name] !== undefined)) total += view.byteLength as number
  }
  for (const [meshIndex, mesh] of list(document, 'meshes').entries()) {
    for (const primitive of mesh.primitives as Records) {
      const draco = isRecord(primitive.extensions) ? primitive.extensions.KHR_draco_mesh_compression : undefined
      if (!isRecord(draco)) continue
      const source = sources.bufferView(draco.bufferView as number)
      const size = source && dracoSize(source)
      if (!size) return { kind: 'unreadableDraco', mesh: meshIndex }
      const attributeBytes = Object.keys(draco.attributes as object).reduce((sum, name) => {
        const accessor = accessors[(primitive.attributes as Record<string, number>)[name]]
        return sum + (accessor ? elementBytes(accessor) : 16)
      }, 0)
      total += size.points * attributeBytes + size.faces * 3 * 4
    }
  }
  return total > BUDGET.geometryBytes ? { kind: 'geometryBytes', value: total, limit: BUDGET.geometryBytes } : total
}

function morphBytes(document: GltfDocument): number {
  const accessors = list(document, 'accessors')
  let total = 0
  for (const mesh of list(document, 'meshes')) {
    for (const primitive of mesh.primitives as Records) {
      const targets = primitive.targets as Records | undefined
      if (!targets?.length) continue
      const position = accessors[(primitive.attributes as Record<string, number>).POSITION]
      const vertices = (position?.count as number | undefined) ?? 0
      const attributes = new Set(targets.flatMap((target) => Object.keys(target))).size
      // three.js packs every target's position, normal and colour into one float texture.
      total += vertices * targets.length * Math.max(attributes, 1) * MORPH_TEXEL_BYTES
    }
  }
  return total
}

function textureBytes(document: GltfDocument, sources: BufferSources): BudgetExcess | number {
  const images = list(document, 'images')
  if (images.length > BUDGET.images) return { kind: 'images', value: images.length, limit: BUDGET.images }
  const sizes: (number | null)[] = []
  for (const [index, image] of images.entries()) {
    // Why skip external images: the viewer never loads them, a white pixel stands in.
    if (typeof image.uri === 'string' && !/^data:/i.test(image.uri)) {
      sizes.push(1)
      continue
    }
    const source = typeof image.uri === 'string' ? bufferSources({ buffers: [{ uri: image.uri }] }, null).buffer(0) : sources.bufferView(image.bufferView as number)
    const size = source && imageSize(source)
    if (!size) return { kind: 'unreadableImage', index }
    if (size.width > BUDGET.imageSide || size.height > BUDGET.imageSide) {
      return { kind: 'imageSide', value: Math.max(size.width, size.height), limit: BUDGET.imageSide, ...size }
    }
    sizes.push(size.width * size.height * RGBA_BYTES * MIPMAPPED)
  }
  const textures = list(document, 'textures')
  if (textures.length > BUDGET.textures) return { kind: 'textures', value: textures.length, limit: BUDGET.textures }
  // three.js uploads one GPU texture per distinct image and sampler; textures sharing both share it.
  const uploads = new Map<string, number>()
  for (const texture of textures) {
    const extensions = isRecord(texture.extensions) ? Object.values(texture.extensions) : []
    const sourcesUsed = [texture.source, ...extensions.map((extension) => (isRecord(extension) ? extension.source : undefined))]
    for (const source of sourcesUsed) {
      if (typeof source === 'number') uploads.set(`${source}:${texture.sampler ?? -1}`, sizes[source] ?? 0)
    }
  }
  return [...uploads.values()].reduce((sum, bytes) => sum + bytes, 0)
}

function drawCallExcess(document: GltfDocument): BudgetExcess | null {
  const nodes = list(document, 'nodes')
  if (nodes.length > BUDGET.nodes) return { kind: 'nodes', value: nodes.length, limit: BUDGET.nodes }
  const primitives = list(document, 'meshes').map((mesh) => (mesh.primitives as unknown[]).length)
  let drawCalls = 0
  for (const node of nodes) {
    // Why one per primitive: GPU instancing draws all instances of a node in a single call.
    if (typeof node.mesh === 'number') drawCalls += primitives[node.mesh]
  }
  return drawCalls > BUDGET.drawCalls ? { kind: 'drawCalls', value: drawCalls, limit: BUDGET.drawCalls } : null
}

function skinExcess(document: GltfDocument): BudgetExcess | null {
  let total = 0
  for (const skin of list(document, 'skins')) {
    const joints = (skin.joints as unknown[]).length
    if (joints > BUDGET.jointsPerSkin) return { kind: 'skinJoints', value: joints, limit: BUDGET.jointsPerSkin }
    total += joints
  }
  return total > BUDGET.skinJoints ? { kind: 'skinJoints', value: total, limit: BUDGET.skinJoints } : null
}

/** The first way a validated document exceeds the viewer's budget, or null when it fits. */
export function gltfBudgetExcess(document: GltfDocument, bin: Uint8Array | null): BudgetExcess | null {
  const excess = drawCallExcess(document) ?? skinExcess(document)
  if (excess) return excess
  const sources = bufferSources(document, bin)
  const geometry = geometryBytes(document, sources)
  if (typeof geometry !== 'number') return geometry
  const textures = textureBytes(document, sources)
  if (typeof textures !== 'number') return textures
  const gpu = textures + morphBytes(document)
  return gpu > BUDGET.gpuBytes ? { kind: 'gpuBytes', value: gpu, limit: BUDGET.gpuBytes } : null
}
