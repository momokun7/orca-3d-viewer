const GLB_MAGIC = 0x46546c67
const GLB_JSON_CHUNK_TYPE = 0x4e4f534a
const GLB_BIN_CHUNK_TYPE = 0x004e4942
const GLB_HEADER_BYTES = 12
const GLB_CHUNK_HEADER_BYTES = 8

export const GLTF_DRACO_EXTENSION = 'KHR_draco_mesh_compression'
export const GLTF_MESHOPT_EXTENSIONS = ['EXT_meshopt_compression', 'KHR_meshopt_compression']
export const GLTF_BASISU_EXTENSION = 'KHR_texture_basisu'

// Extensions three.js r186's GLTFLoader reads, with the decoders this viewer wires up for it.
const SUPPORTED_EXTENSIONS = new Set([
  'KHR_draco_mesh_compression',
  'KHR_lights_punctual',
  'KHR_materials_clearcoat',
  'KHR_materials_dispersion',
  'KHR_materials_ior',
  'KHR_materials_sheen',
  'KHR_materials_specular',
  'KHR_materials_transmission',
  'KHR_materials_iridescence',
  'KHR_materials_anisotropy',
  'KHR_materials_unlit',
  'KHR_materials_volume',
  'KHR_materials_emissive_strength',
  'KHR_texture_basisu',
  'KHR_texture_transform',
  'KHR_mesh_quantization',
  'EXT_materials_bump',
  'EXT_texture_webp',
  'EXT_texture_avif',
  'EXT_meshopt_compression',
  'KHR_meshopt_compression',
  'EXT_mesh_gpu_instancing'
])

export type GltfModelData = ArrayBuffer | string
export type GltfDocument = Record<string, unknown>

export type GltfExternalResources = {
  buffers: string[]
  images: string[]
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function isDataUri(uri: string): boolean {
  return /^data:/i.test(uri)
}

type GlbChunk = { type: number; start: number; length: number }

function readGlbChunks(data: ArrayBuffer): GlbChunk[] | null {
  if (data.byteLength < GLB_HEADER_BYTES + GLB_CHUNK_HEADER_BYTES) {
    return null
  }
  const view = new DataView(data)
  if (view.getUint32(0, true) !== GLB_MAGIC) {
    return null
  }
  const chunks: GlbChunk[] = []
  for (let at = GLB_HEADER_BYTES; at + GLB_CHUNK_HEADER_BYTES <= data.byteLength; ) {
    const length = view.getUint32(at, true)
    const start = at + GLB_CHUNK_HEADER_BYTES
    if (start + length > data.byteLength) {
      break
    }
    chunks.push({ type: view.getUint32(at + 4, true), start, length })
    at = start + length
  }
  return chunks
}

/** The bytes of a GLB's BIN chunk, or null for text or a GLB without one. */
export function readGlbBinChunk(data: GltfModelData): Uint8Array | null {
  if (typeof data === 'string') {
    return null
  }
  const chunk = readGlbChunks(data)?.find((entry) => entry.type === GLB_BIN_CHUNK_TYPE)
  return chunk ? new Uint8Array(data, chunk.start, chunk.length) : null
}

/**
 * Why a GLB is not laid out as the spec says it must be, or null when it is: the header's length is
 * the file's, and the chunks are one JSON chunk then at most one BIN chunk, covering the file exactly.
 * Anything else is refused, since three.js reads the last JSON and BIN chunks and the viewer the
 * first: a second chunk would load a document the checks never saw.
 */
export function glbLayoutProblem(data: GltfModelData): string | null {
  if (typeof data === 'string') return null
  const chunks = readGlbChunks(data)
  if (!chunks) return 'is not a GLB container'
  const view = new DataView(data)
  if (view.getUint32(8, true) !== data.byteLength) return 'has a length other than its header declares'
  const covered = chunks.reduce((end, chunk) => Math.max(end, chunk.start + chunk.length), GLB_HEADER_BYTES)
  if (covered !== data.byteLength) return 'has bytes outside its chunks'
  if (chunks.length === 0 || chunks[0].type !== GLB_JSON_CHUNK_TYPE) return 'does not start with a JSON chunk'
  if (chunks.length > 2 || (chunks.length === 2 && chunks[1].type !== GLB_BIN_CHUNK_TYPE)) {
    return 'has chunks other than one JSON and one BIN chunk'
  }
  return null
}

export type GlbTruncation = { declaredBytes: number; actualBytes: number }

/** A GLB shorter than its header says, as an interrupted download or copy leaves it; null otherwise. */
export function glbTruncation(data: GltfModelData): GlbTruncation | null {
  if (typeof data === 'string' || data.byteLength < GLB_HEADER_BYTES) {
    return null
  }
  const view = new DataView(data)
  if (view.getUint32(0, true) !== GLB_MAGIC) {
    return null
  }
  const declaredBytes = view.getUint32(8, true)
  return declaredBytes > data.byteLength ? { declaredBytes, actualBytes: data.byteLength } : null
}

/** The JSON text of a `.gltf` (without a byte-order mark) or of a `.glb` container's first chunk. */
export function gltfJsonText(data: GltfModelData): string | null {
  if (typeof data === 'string') {
    return data.replace(/^﻿/, '')
  }
  const [first] = readGlbChunks(data) ?? []
  if (!first || first.type !== GLB_JSON_CHUNK_TYPE || first.start !== GLB_HEADER_BYTES + GLB_CHUNK_HEADER_BYTES) {
    return null
  }
  return new TextDecoder().decode(new Uint8Array(data, first.start, first.length))
}

/** The glTF JSON document of a `.gltf` text or a `.glb` container, or null when unreadable. */
export function readGltfDocument(data: GltfModelData): GltfDocument | null {
  const text = gltfJsonText(data)
  if (text === null) {
    return null
  }
  try {
    const parsed: unknown = JSON.parse(text)
    return isRecord(parsed) ? parsed : null
  } catch {
    return null
  }
}

function stringList(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((entry): entry is string => typeof entry === 'string')
    : []
}

export function gltfUsesExtension(document: GltfDocument, extension: string): boolean {
  return (
    stringList(document.extensionsUsed).includes(extension) ||
    stringList(document.extensionsRequired).includes(extension)
  )
}

function isMeshoptFallback(buffer: Record<string, unknown>): boolean {
  const extensions = isRecord(buffer.extensions) ? buffer.extensions : {}
  return GLTF_MESHOPT_EXTENSIONS.some((name) => isRecord(extensions[name]) && extensions[name].fallback === true)
}

/**
 * Whether the buffers are shaped as the container needs: a URI-less buffer is either a GLB's first
 * (its BIN chunk) or a Meshopt fallback the decoder fills. GLTFLoader throws a TypeError on any other.
 */
export function gltfBuffersFitContainer(document: GltfDocument, isGlb: boolean): boolean {
  return entries(document, 'buffers').every(
    (buffer, index) => isRecord(buffer) && ('uri' in buffer || (isGlb && index === 0) || isMeshoptFallback(buffer))
  )
}

/** Required extensions the viewer cannot read, which would otherwise fail as a generic parse error. */
export function gltfUnsupportedRequiredExtensions(document: GltfDocument): string[] {
  return stringList(document.extensionsRequired).filter((extension) => !SUPPORTED_EXTENSIONS.has(extension))
}

function entries(document: GltfDocument, key: string): unknown[] {
  const value = document[key]
  return Array.isArray(value) ? value : []
}

function externalUris(document: GltfDocument, key: 'buffers' | 'images'): string[] {
  const uris = new Set<string>()
  for (const entry of entries(document, key)) {
    if (isRecord(entry) && 'uri' in entry) {
      // Why a non-string counts: GLTFLoader would turn it into '' and fetch a relative URL.
      const uri = typeof entry.uri === 'string' ? entry.uri : String(entry.uri)
      if (!isDataUri(uri)) uris.add(uri)
    }
  }
  return [...uris]
}

/** Buffer and image URIs that point outside the document (not `data:` URIs). */
export function gltfExternalResources(document: GltfDocument): GltfExternalResources {
  return { buffers: externalUris(document, 'buffers'), images: externalUris(document, 'images') }
}
