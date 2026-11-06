// Refuses a model before three.js allocates for it when its JSON declares more than the viewer can
// hold. Runs after validateGltfStructure, so every index, enum and count here is known to be valid.
// It counts what three.js will allocate, not what the file stores: zero-filled sparse accessors,
// strided views copied per accessor, Meshopt and Draco decoded sizes (Draco's from its own header),
// strips and fans rebuilt as triangle lists, instance matrices, keyframe tracks copied per channel,
// morph target textures, and one GPU texture per image, sampler and colour space. It also bounds the
// work per frame (draw calls, vertices drawn) and its own running time.
import { type BufferSources, bufferSources } from './byte-sources.ts'
import { type DracoSize, dracoSize } from './draco-header.ts'
import { GLTF_MESHOPT_EXTENSIONS, type GltfDocument, isRecord } from './gltf-document-inspection.ts'
import { COMPONENT_BYTES, TYPE_COMPONENTS } from './gltf-validation.ts'
import { type ImageSize, imageSize } from './image-dimensions.ts'

export const BUDGET = {
  /** Decoded vertex, index, instance and animation data on the CPU side. */
  geometryBytes: 512 * 1024 * 1024,
  /** Textures (with mipmaps) and morph target data on the GPU. */
  gpuBytes: 1024 * 1024 * 1024,
  nodes: 100_000,
  drawCalls: 50_000,
  /** Vertices the GPU processes per frame, instances included. */
  drawnVertices: 100_000_000,
  materials: 16_384,
  images: 1024,
  textures: 16_384,
  animationChannels: 100_000,
  /** Keyframe tracks three.js builds: one per channel, more for weights on multi-primitive meshes. */
  animationTracks: 100_000,
  /** Everything above together, CPU and GPU, as one ceiling. */
  totalBytes: 2 * 1024 * 1024 * 1024,
  imageSide: 16_384,
  skinJoints: 65_536,
  jointsPerSkin: 4096,
  /** How long the budget check may run before it refuses the model as too complex. */
  checkMilliseconds: 2000
} as const

export type BudgetExcess =
  | {
      kind:
        | 'geometryBytes'
        | 'gpuBytes'
        | 'nodes'
        | 'drawCalls'
        | 'drawnVertices'
        | 'materials'
        | 'images'
        | 'textures'
        | 'animationChannels'
        | 'animationTracks'
        | 'totalBytes'
        | 'skinJoints'
      value: number
      limit: number
    }
  | { kind: 'imageSide'; value: number; limit: number; width: number; height: number }
  | { kind: 'unreadableImage'; index: number }
  | { kind: 'unreadableDraco'; mesh: number }
  | { kind: 'tooComplex' }

type Records = Record<string, unknown>[]
const list = (document: GltfDocument, key: string): Records => (Array.isArray(document[key]) ? (document[key] as Records) : [])

// Why 4/3: a full mipmap chain adds a third to the base level.
const MIPMAPPED = 4 / 3
const RGBA_BYTES = 4
const MORPH_TEXEL_BYTES = 16
const MATRIX_BYTES = 64
const FLOAT_BYTES = 4
// Strips and fans become JavaScript arrays of indices first: about this many bytes each, transiently.
const TRANSIENT_INDEX_BYTES = 24
const STRIP_MODES = new Set([5, 6])
// Texture slots three.js reads as sRGB; every other slot is linear, and each needs its own texture.
const SRGB_TEXTURES = new Set(['baseColorTexture', 'emissiveTexture', 'sheenColorTexture', 'specularColorTexture'])

class TooComplex extends Error {}

type Context = {
  document: GltfDocument
  accessors: Records
  bufferViews: Records
  sources: BufferSources
  deadline: number
  dracoSizes: Map<number, DracoSize | null>
  imageSizes: Map<string, ImageSize | null>
  /** Decoded images kept on the CPU (ImageBitmaps), once each. */
  decodedImageBytes: number
}

function checkTime(context: Context): void {
  if (performance.now() > context.deadline) throw new TooComplex()
}

function elementBytes(accessor: Record<string, unknown>): number {
  return COMPONENT_BYTES.get(accessor.componentType as number)! * TYPE_COMPONENTS.get(accessor.type as string)!
}

function dracoSizeOf(context: Context, viewIndex: number): DracoSize | null {
  if (!context.dracoSizes.has(viewIndex)) {
    checkTime(context)
    const source = context.sources.bufferView(viewIndex)
    context.dracoSizes.set(viewIndex, source && dracoSize(source))
  }
  return context.dracoSizes.get(viewIndex) ?? null
}

/** Vertices a primitive stores, from its POSITION accessor or its Draco header. */
function primitiveVertices(context: Context, primitive: Record<string, unknown>): number {
  const draco = isRecord(primitive.extensions) ? primitive.extensions.KHR_draco_mesh_compression : undefined
  if (isRecord(draco)) return dracoSizeOf(context, draco.bufferView as number)?.points ?? 0
  const position = context.accessors[(primitive.attributes as Record<string, number>).POSITION]
  return (position?.count as number | undefined) ?? 0
}

/**
 * Vertices a primitive makes the GPU process each frame: one per index when indexed (strips and fans
 * once rebuilt as triangle lists), each run once more per morph target the shader loops over.
 */
function primitiveDrawnVertices(context: Context, primitive: Record<string, unknown>): number {
  const draco = isRecord(primitive.extensions) ? primitive.extensions.KHR_draco_mesh_compression : undefined
  let drawn = isRecord(draco)
    ? (dracoSizeOf(context, draco.bufferView as number)?.faces ?? 0) * 3
    : typeof primitive.indices === 'number'
      ? (context.accessors[primitive.indices].count as number)
      : primitiveVertices(context, primitive)
  if (STRIP_MODES.has(primitive.mode as number)) drawn = Math.max(0, drawn - 2) * 3
  const targets = Array.isArray(primitive.targets) ? primitive.targets.length : 0
  return drawn * (1 + targets)
}

function accessorBytes(context: Context): number {
  let total = 0
  // three.js copies a strided view into one interleaved buffer per (view, component type, stride slice, count).
  const interleaved = new Map<string, number>()
  for (const accessor of context.accessors) {
    const count = accessor.count as number
    const view = typeof accessor.bufferView === 'number' ? context.bufferViews[accessor.bufferView] : undefined
    const stride = view?.byteStride as number | undefined
    if (stride !== undefined && stride !== elementBytes(accessor)) {
      const bytes = count * stride
      const slice = Math.floor(((accessor.byteOffset as number | undefined) ?? 0) / stride)
      interleaved.set(`${accessor.bufferView}:${accessor.componentType}:${slice}:${count}`, bytes)
      // Why twice for sparse: three.js slices the whole interleaved array before applying the sparse values.
      if (accessor.sparse !== undefined) total += bytes
    } else {
      total += count * elementBytes(accessor)
    }
  }
  for (const bytes of interleaved.values()) total += bytes
  return total
}

/** GLTFLoader copies each buffer view it reads in full, once; charge every view something reads. */
function bufferViewBytes(context: Context): number {
  const used = new Set<number>()
  for (const accessor of context.accessors) {
    if (typeof accessor.bufferView === 'number') used.add(accessor.bufferView)
    const sparse = accessor.sparse as Record<string, Record<string, unknown>> | undefined
    if (sparse) used.add(sparse.indices.bufferView as number).add(sparse.values.bufferView as number)
  }
  for (const image of list(context.document, 'images')) if (typeof image.bufferView === 'number') used.add(image.bufferView)
  for (const mesh of list(context.document, 'meshes')) {
    for (const primitive of mesh.primitives as Records) {
      const draco = isRecord(primitive.extensions) ? primitive.extensions.KHR_draco_mesh_compression : undefined
      if (isRecord(draco)) used.add(draco.bufferView as number)
    }
  }
  let total = 0
  for (const index of used) total += context.bufferViews[index].byteLength as number
  return total
}

function geometryBytes(context: Context): BudgetExcess | number {
  const { document, accessors } = context
  let total = accessorBytes(context) + bufferViewBytes(context)
  for (const view of context.bufferViews) {
    const extensions = isRecord(view.extensions) ? view.extensions : {}
    if (GLTF_MESHOPT_EXTENSIONS.some((name) => extensions[name] !== undefined)) total += view.byteLength as number
  }
  for (const [meshIndex, mesh] of list(document, 'meshes').entries()) {
    for (const primitive of mesh.primitives as Records) {
      if (STRIP_MODES.has(primitive.mode as number)) {
        const indices = typeof primitive.indices === 'number' ? (accessors[primitive.indices].count as number) : primitiveVertices(context, primitive)
        total += Math.max(0, indices - 2) * 3 * FLOAT_BYTES + indices * TRANSIENT_INDEX_BYTES
      }
      const draco = isRecord(primitive.extensions) ? primitive.extensions.KHR_draco_mesh_compression : undefined
      if (!isRecord(draco)) continue
      const size = dracoSizeOf(context, draco.bufferView as number)
      if (!size) return { kind: 'unreadableDraco', mesh: meshIndex }
      const attributeBytes = Object.keys(draco.attributes as object).reduce((sum, name) => {
        const accessor = accessors[(primitive.attributes as Record<string, number>)[name]]
        return sum + (accessor ? elementBytes(accessor) : 16)
      }, 0)
      total += size.points * attributeBytes + size.faces * 3 * 4
    }
  }
  total += animationBytes(context)
  total += instanceBytes(context)
  return total > BUDGET.geometryBytes ? { kind: 'geometryBytes', value: total, limit: BUDGET.geometryBytes } : total
}

/**
 * Tracks three.js builds for a channel: one, except that weights on a node whose mesh has several
 * primitives (a Group) get one per child with morph targets: its own primitives and its glTF children.
 */
function channelTracks(context: Context, target: Record<string, unknown>): number {
  if (target.path !== 'weights' || typeof target.node !== 'number') return 1
  const nodes = list(context.document, 'nodes')
  const meshes = list(context.document, 'meshes')
  const node = nodes[target.node]
  const primitives = typeof node.mesh === 'number' ? (meshes[node.mesh].primitives as Records) : []
  if (primitives.length <= 1) return 1
  const morphChildren = ((node.children as number[] | undefined) ?? []).filter((child) => {
    const mesh = nodes[child].mesh
    return typeof mesh === 'number' && (meshes[mesh].primitives as Records).some((primitive) => Array.isArray(primitive.targets))
  }).length
  return primitives.length + morphChildren
}

function animationTracks(context: Context): number {
  let total = 0
  for (const animation of list(context.document, 'animations')) {
    for (const channel of animation.channels as Records) total += channelTracks(context, channel.target as Record<string, unknown>)
  }
  return total
}

/** three.js copies each channel's keyframes to floats once per track it builds for the channel. */
function animationBytes(context: Context): number {
  let total = 0
  for (const animation of list(context.document, 'animations')) {
    const samplers = animation.samplers as Records
    for (const channel of animation.channels as Records) {
      const sampler = samplers[channel.sampler as number]
      const input = context.accessors[sampler.input as number]
      const output = context.accessors[sampler.output as number]
      const copies = channelTracks(context, channel.target as Record<string, unknown>)
      const keys = (input.count as number) + (output.count as number) * TYPE_COMPONENTS.get(output.type as string)!
      total += keys * FLOAT_BYTES * copies
    }
  }
  return total
}

function instanceCount(context: Context, node: Record<string, unknown>): number {
  const instancing = isRecord(node.extensions) ? node.extensions.EXT_mesh_gpu_instancing : undefined
  if (!isRecord(instancing)) return 1
  const [first] = Object.values(instancing.attributes as Record<string, number>)
  return context.accessors[first].count as number
}

/** Each primitive of an instanced node is its own InstancedMesh with a matrix per instance. */
function instanceBytes(context: Context): number {
  const meshes = list(context.document, 'meshes')
  let total = 0
  for (const node of list(context.document, 'nodes')) {
    if (typeof node.mesh !== 'number') continue
    const instances = instanceCount(context, node)
    if (instances > 1) total += instances * MATRIX_BYTES * (meshes[node.mesh].primitives as unknown[]).length
  }
  return total
}

function frameExcess(context: Context): BudgetExcess | null {
  const { document } = context
  const nodes = list(document, 'nodes')
  if (nodes.length > BUDGET.nodes) return { kind: 'nodes', value: nodes.length, limit: BUDGET.nodes }
  const materials = list(document, 'materials').length
  if (materials > BUDGET.materials) return { kind: 'materials', value: materials, limit: BUDGET.materials }
  const meshes = list(document, 'meshes')
  const meshVertices = new Map<number, number>()
  let drawCalls = 0
  let drawnVertices = 0
  for (const node of nodes) {
    if (typeof node.mesh !== 'number') continue
    const primitives = meshes[node.mesh].primitives as Records
    // Why one per primitive: GPU instancing draws all instances of a node in a single call.
    drawCalls += primitives.length
    if (!meshVertices.has(node.mesh)) {
      meshVertices.set(node.mesh, primitives.reduce((sum, primitive) => sum + primitiveDrawnVertices(context, primitive), 0))
    }
    drawnVertices += meshVertices.get(node.mesh)! * instanceCount(context, node)
  }
  if (drawCalls > BUDGET.drawCalls) return { kind: 'drawCalls', value: drawCalls, limit: BUDGET.drawCalls }
  if (drawnVertices > BUDGET.drawnVertices) return { kind: 'drawnVertices', value: drawnVertices, limit: BUDGET.drawnVertices }
  const channels = list(document, 'animations').reduce((sum, animation) => sum + (animation.channels as unknown[]).length, 0)
  if (channels > BUDGET.animationChannels) return { kind: 'animationChannels', value: channels, limit: BUDGET.animationChannels }
  const tracks = animationTracks(context)
  if (tracks > BUDGET.animationTracks) return { kind: 'animationTracks', value: tracks, limit: BUDGET.animationTracks }
  return null
}

function morphBytes(context: Context): number {
  let total = 0
  for (const mesh of list(context.document, 'meshes')) {
    for (const primitive of mesh.primitives as Records) {
      const targets = primitive.targets as Records | undefined
      if (!targets?.length) continue
      const attributes = new Set(targets.flatMap((target) => Object.keys(target))).size
      // three.js packs every target's position, normal and colour into one float texture.
      total += primitiveVertices(context, primitive) * targets.length * Math.max(attributes, 1) * MORPH_TEXEL_BYTES
    }
  }
  return total
}

function imageSizeOf(context: Context, image: Record<string, unknown>): ImageSize | null {
  const key = typeof image.uri === 'string' ? `uri:${image.uri}` : `view:${image.bufferView}`
  if (!context.imageSizes.has(key)) {
    checkTime(context)
    const source =
      typeof image.uri === 'string'
        ? bufferSources({ buffers: [{ uri: image.uri }] }, null).buffer(0)
        : context.sources.bufferView(image.bufferView as number)
    context.imageSizes.set(key, source && imageSize(source))
  }
  return context.imageSizes.get(key) ?? null
}

/** (texture index, colour space) for every texture slot of every material, at any depth. */
function textureUses(document: GltfDocument): [number, 'srgb' | 'linear'][] {
  const uses: [number, 'srgb' | 'linear'][] = []
  const visit = (value: unknown, depth: number): void => {
    if (depth > 16 || !isRecord(value)) return
    for (const [key, child] of Object.entries(value)) {
      if (/Texture$/.test(key) && isRecord(child) && typeof child.index === 'number') {
        uses.push([child.index, SRGB_TEXTURES.has(key) ? 'srgb' : 'linear'])
      }
      visit(child, depth + 1)
    }
  }
  for (const material of list(document, 'materials')) visit(material, 0)
  return uses
}

function textureBytes(context: Context): BudgetExcess | number {
  const images = list(context.document, 'images')
  if (images.length > BUDGET.images) return { kind: 'images', value: images.length, limit: BUDGET.images }
  const textures = list(context.document, 'textures')
  if (textures.length > BUDGET.textures) return { kind: 'textures', value: textures.length, limit: BUDGET.textures }
  const uses = textureUses(context.document)
  // Only images a material's texture uses are ever decoded; the rest are never read.
  const usedImages = new Set<number>()
  for (const [textureIndex] of uses) {
    const texture = textures[textureIndex]
    const extensions = isRecord(texture.extensions) ? Object.values(texture.extensions) : []
    for (const source of [texture.source, ...extensions.map((extension) => (isRecord(extension) ? extension.source : undefined))]) {
      if (typeof source === 'number') usedImages.add(source)
    }
  }
  const imageBytes: number[] = []
  for (const [index, image] of images.entries()) {
    // Why skip external and unused images: the viewer never decodes them (a white pixel stands in for external ones).
    if ((typeof image.uri === 'string' && !/^data:/i.test(image.uri)) || !usedImages.has(index)) {
      imageBytes.push(RGBA_BYTES)
      continue
    }
    const size = imageSizeOf(context, image)
    if (!size) return { kind: 'unreadableImage', index }
    if (size.width > BUDGET.imageSide || size.height > BUDGET.imageSide) {
      return { kind: 'imageSide', value: Math.max(size.width, size.height), limit: BUDGET.imageSide, ...size }
    }
    imageBytes.push(size.width * size.height * RGBA_BYTES * MIPMAPPED)
  }
  // three.js uploads one GPU texture per distinct image, sampler and colour space.
  const uploads = new Map<string, number>()
  for (const [textureIndex, colorSpace] of uses) {
    const texture = textures[textureIndex]
    const extensions = isRecord(texture.extensions) ? Object.values(texture.extensions) : []
    const sourcesUsed = [texture.source, ...extensions.map((extension) => (isRecord(extension) ? extension.source : undefined))]
    for (const source of sourcesUsed) {
      if (typeof source === 'number') uploads.set(`${source}:${texture.sampler ?? -1}:${colorSpace}`, imageBytes[source] ?? 0)
    }
  }
  context.decodedImageBytes = [...usedImages].reduce((sum, index) => sum + (imageBytes[index] ?? 0) / MIPMAPPED, 0)
  return [...uploads.values()].reduce((sum, bytes) => sum + bytes, 0)
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
export function gltfBudgetExcess(
  document: GltfDocument,
  bin: Uint8Array | null,
  timeLimitMs: number = BUDGET.checkMilliseconds
): BudgetExcess | null {
  const context: Context = {
    document,
    accessors: list(document, 'accessors'),
    bufferViews: list(document, 'bufferViews'),
    sources: bufferSources(document, bin),
    deadline: performance.now() + timeLimitMs,
    dracoSizes: new Map(),
    imageSizes: new Map(),
    decodedImageBytes: 0
  }
  try {
    const excess = skinExcess(document) ?? frameExcess(context)
    if (excess) return excess
    const geometry = geometryBytes(context)
    if (typeof geometry !== 'number') return geometry
    const textures = textureBytes(context)
    if (typeof textures !== 'number') return textures
    const gpu = textures + morphBytes(context)
    if (gpu > BUDGET.gpuBytes) return { kind: 'gpuBytes', value: gpu, limit: BUDGET.gpuBytes }
    // Geometry lives twice (CPU arrays and GPU buffers), and decoded images stay on the CPU too.
    const total = geometry * 2 + gpu + context.decodedImageBytes
    return total > BUDGET.totalBytes ? { kind: 'totalBytes', value: total, limit: BUDGET.totalBytes } : null
  } catch (error) {
    if (error instanceof TooComplex) return { kind: 'tooComplex' }
    throw error
  }
}

/** The decoded bytes the budget allows for a parse, for checking what decoders actually return. */
export const DECODE_ALLOWANCE_BYTES = BUDGET.geometryBytes
