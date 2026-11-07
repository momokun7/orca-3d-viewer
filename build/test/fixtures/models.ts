// Test models built in code, so every fixture is ours to ship and hostile fields are easy to plant.
import { Document, NodeIO } from '@gltf-transform/core'
import { EXTMeshoptCompression, KHRDracoMeshCompression } from '@gltf-transform/extensions'
import draco3d from 'draco3dgltf'
import { MeshoptEncoder } from 'meshoptimizer'

export type GltfJson = Record<string, unknown>

const TRIANGLE_POSITIONS = new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0])
const KEYFRAME_TIMES = new Float32Array([0, 1])
const KEYFRAME_TRANSLATIONS = new Float32Array([0, 0, 0, 0, 1, 0])

function concatBytes(parts: Uint8Array[]): Uint8Array {
  const out = new Uint8Array(parts.reduce((sum, part) => sum + part.byteLength, 0))
  let offset = 0
  for (const part of parts) {
    out.set(part, offset)
    offset += part.byteLength
  }
  return out
}

function bytesOf(array: Float32Array): Uint8Array {
  return new Uint8Array(array.buffer, array.byteOffset, array.byteLength)
}

/** The binary payload every triangle fixture shares: positions, then an animation's input and output. */
export const TRIANGLE_BIN = concatBytes([
  bytesOf(TRIANGLE_POSITIONS),
  bytesOf(KEYFRAME_TIMES),
  bytesOf(KEYFRAME_TRANSLATIONS)
])

export type TriangleOptions = {
  /** Clip names; each becomes an animation that moves the node. */
  animationNames?: string[]
  /** Image URIs, each wired to a texture on the triangle's material. */
  imageUris?: string[]
  /** Where the binary buffer lives; omitted means the GLB BIN chunk. */
  bufferUri?: string
}

/** A one-triangle glTF document. */
export function triangleGltf({ animationNames = [], imageUris = [], bufferUri }: TriangleOptions = {}): GltfJson {
  const json: GltfJson = {
    asset: { version: '2.0', generator: 'orca-3d-viewer tests' },
    scene: 0,
    scenes: [{ nodes: [0] }],
    nodes: [{ mesh: 0 }],
    meshes: [{ primitives: [{ attributes: { POSITION: 0 }, material: 0 }] }],
    materials: [
      imageUris.length > 0
        ? { pbrMetallicRoughness: { baseColorTexture: { index: 0 } } }
        : { pbrMetallicRoughness: { baseColorFactor: [0.8, 0.5, 0.2, 1] } }
    ],
    buffers: [{ byteLength: TRIANGLE_BIN.byteLength, ...(bufferUri === undefined ? {} : { uri: bufferUri }) }],
    bufferViews: [
      { buffer: 0, byteOffset: 0, byteLength: 36 },
      { buffer: 0, byteOffset: 36, byteLength: 8 },
      { buffer: 0, byteOffset: 44, byteLength: 24 }
    ],
    accessors: [
      { bufferView: 0, componentType: 5126, count: 3, type: 'VEC3', min: [0, 0, 0], max: [1, 1, 0] },
      { bufferView: 1, componentType: 5126, count: 2, type: 'SCALAR', min: [0], max: [1] },
      { bufferView: 2, componentType: 5126, count: 2, type: 'VEC3' }
    ]
  }
  if (imageUris.length > 0) {
    json.images = imageUris.map((uri) => ({ uri }))
    json.textures = imageUris.map((_, index) => ({ source: index }))
  }
  if (animationNames.length > 0) {
    json.animations = animationNames.map((name) => ({
      name,
      samplers: [{ input: 1, output: 2, interpolation: 'LINEAR' }],
      channels: [{ sampler: 0, target: { node: 0, path: 'translation' } }]
    }))
  }
  return json
}

function padTo4(bytes: Uint8Array, fill: number): Uint8Array {
  const padded = new Uint8Array(Math.ceil(bytes.byteLength / 4) * 4).fill(fill)
  padded.set(bytes)
  return padded
}

/** Packs a glTF JSON document and an optional BIN chunk into a GLB container. */
export function glb(json: GltfJson, bin: Uint8Array | null = TRIANGLE_BIN): Uint8Array<ArrayBuffer> {
  const jsonChunk = padTo4(new TextEncoder().encode(JSON.stringify(json)), 0x20)
  const binChunk = bin ? padTo4(bin, 0) : null
  const total = 12 + 8 + jsonChunk.byteLength + (binChunk ? 8 + binChunk.byteLength : 0)
  const out = new Uint8Array(total)
  const view = new DataView(out.buffer)
  view.setUint32(0, 0x46546c67, true)
  view.setUint32(4, 2, true)
  view.setUint32(8, total, true)
  view.setUint32(12, jsonChunk.byteLength, true)
  view.setUint32(16, 0x4e4f534a, true)
  out.set(jsonChunk, 20)
  if (binChunk) {
    const at = 20 + jsonChunk.byteLength
    view.setUint32(at, binChunk.byteLength, true)
    view.setUint32(at + 4, 0x004e4942, true)
    out.set(binChunk, at + 8)
  }
  return out
}

/** A `.gltf` text whose buffer is embedded as a data URI. */
export function embeddedGltfText(options: Omit<TriangleOptions, 'bufferUri'> = {}): string {
  const uri = `data:application/octet-stream;base64,${Buffer.from(TRIANGLE_BIN).toString('base64')}`
  return JSON.stringify(triangleGltf({ ...options, bufferUri: uri }))
}

function gridDocument(): Document {
  const document = new Document()
  const buffer = document.createBuffer()
  const size = 24
  const positions: number[] = []
  const indices: number[] = []
  for (let z = 0; z <= size; z++) {
    for (let x = 0; x <= size; x++) {
      positions.push(x / size, Math.sin(x / 3) * Math.cos(z / 3) * 0.1, z / size)
    }
  }
  for (let z = 0; z < size; z++) {
    for (let x = 0; x < size; x++) {
      const a = z * (size + 1) + x
      indices.push(a, a + size + 1, a + 1, a + 1, a + size + 1, a + size + 2)
    }
  }
  const primitive = document
    .createPrimitive()
    .setAttribute(
      'POSITION',
      document.createAccessor().setType('VEC3').setArray(new Float32Array(positions)).setBuffer(buffer)
    )
    .setIndices(document.createAccessor().setType('SCALAR').setArray(new Uint16Array(indices)).setBuffer(buffer))
  const mesh = document.createMesh().addPrimitive(primitive)
  document.createScene().addChild(document.createNode().setMesh(mesh))
  return document
}

/** A Draco-compressed GLB, encoded with Google's reference encoder. */
export async function dracoGlb(): Promise<Uint8Array> {
  const io = new NodeIO()
    .registerExtensions([KHRDracoMeshCompression])
    .registerDependencies({ 'draco3d.encoder': await draco3d.createEncoderModule() })
  const document = gridDocument()
  document.createExtension(KHRDracoMeshCompression).setRequired(true)
  return io.writeBinary(document)
}

/** A Meshopt-compressed GLB. */
export async function meshoptGlb(): Promise<Uint8Array> {
  await MeshoptEncoder.ready
  const io = new NodeIO()
    .registerExtensions([EXTMeshoptCompression])
    .registerDependencies({ 'meshopt.encoder': MeshoptEncoder })
  const document = gridDocument()
  document
    .createExtension(EXTMeshoptCompression)
    .setRequired(true)
    .setEncoderOptions({ method: EXTMeshoptCompression.EncoderMethod.QUANTIZE })
  return io.writeBinary(document)
}

export const GRID_VERTEX_COUNT = 25 * 25

/** The Meshopt GLB, declaring the ratified KHR_meshopt_compression name instead of EXT_. */
export async function khrMeshoptGlb(): Promise<Uint8Array> {
  const bytes = await meshoptGlb()
  const text = Buffer.from(bytes).toString('latin1').replaceAll('EXT_meshopt_compression', 'KHR_meshopt_compression')
  return Uint8Array.from(Buffer.from(text, 'latin1'))
}

// A unit square facing +Z, so the camera's default view sees its texture at the canvas centre.
const QUAD_POSITIONS = new Float32Array([-0.5, -0.5, 0, 0.5, -0.5, 0, 0.5, 0.5, 0, -0.5, 0.5, 0])
const QUAD_UVS = new Float32Array([0, 1, 1, 1, 1, 0, 0, 0])
const QUAD_INDICES = new Uint16Array([0, 1, 2, 0, 2, 3])

/**
 * An unlit square textured with `png`, embedded either in the GLB's BIN chunk (GLTFLoader turns it
 * into a blob: URL) or as a data: URI in a .gltf text.
 */
export function texturedQuad(
  png: Uint8Array,
  embedding: 'bufferView' | 'dataUri',
  { ktx2 = false }: { ktx2?: boolean } = {}
): Uint8Array | string {
  const geometry = concatBytes([bytesOf(QUAD_POSITIONS), bytesOf(QUAD_UVS), new Uint8Array(QUAD_INDICES.buffer)])
  const imageOffset = geometry.byteLength
  const bin = concatBytes([geometry, padTo4(png, 0)])
  const json: GltfJson = {
    asset: { version: '2.0' },
    extensionsUsed: ['KHR_materials_unlit'],
    scene: 0,
    scenes: [{ nodes: [0] }],
    nodes: [{ mesh: 0 }],
    meshes: [{ primitives: [{ attributes: { POSITION: 0, TEXCOORD_0: 1 }, indices: 2, material: 0 }] }],
    materials: [{ pbrMetallicRoughness: { baseColorTexture: { index: 0 } }, extensions: { KHR_materials_unlit: {} } }],
    textures: [{ source: 0 }],
    bufferViews: [
      { buffer: 0, byteOffset: 0, byteLength: 48 },
      { buffer: 0, byteOffset: 48, byteLength: 32 },
      { buffer: 0, byteOffset: 80, byteLength: 12 }
    ],
    accessors: [
      { bufferView: 0, componentType: 5126, count: 4, type: 'VEC3', min: [-0.5, -0.5, 0], max: [0.5, 0.5, 0] },
      { bufferView: 1, componentType: 5126, count: 4, type: 'VEC2' },
      { bufferView: 2, componentType: 5123, count: 6, type: 'SCALAR' }
    ]
  }
  if (ktx2) {
    // The texture's image is a KTX2 file, read through KHR_texture_basisu.
    json.extensionsUsed = ['KHR_materials_unlit', 'KHR_texture_basisu']
    json.extensionsRequired = ['KHR_texture_basisu']
    json.textures = [{ extensions: { KHR_texture_basisu: { source: 0 } } }]
  }
  const mimeType = ktx2 ? 'image/ktx2' : 'image/png'
  if (embedding === 'bufferView') {
    json.buffers = [{ byteLength: bin.byteLength }]
    ;(json.bufferViews as unknown[]).push({ buffer: 0, byteOffset: imageOffset, byteLength: png.byteLength })
    json.images = [{ bufferView: 3, mimeType }]
    return glb(json, bin)
  }
  json.buffers = [
    { byteLength: geometry.byteLength, uri: `data:application/octet-stream;base64,${Buffer.from(geometry).toString('base64')}` }
  ]
  json.images = [{ uri: `data:${mimeType};base64,${Buffer.from(png).toString('base64')}` }]
  return JSON.stringify(json)
}

/** The triangle's three vertices drawn as a point cloud (glTF mode 0). */
export function pointCloudGlb(): Uint8Array {
  const json = triangleGltf()
  ;(json.meshes as { primitives: Record<string, unknown>[] }[])[0].primitives[0].mode = 0
  return glb(json)
}

/** A valid glTF with nodes but no scenes, as asset libraries are saved. */
export function scenelessGlb(): Uint8Array {
  const json = triangleGltf()
  delete json.scene
  delete json.scenes
  return glb(json)
}
