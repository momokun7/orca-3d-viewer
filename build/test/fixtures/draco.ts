import { Document, NodeIO } from '@gltf-transform/core'
import { KHRDracoMeshCompression } from '@gltf-transform/extensions'
import draco3d from 'draco3dgltf'

const varint = (value: number): number[] => {
  const bytes: number[] = []
  do {
    bytes.push((value & 0x7f) | (value > 0x7f ? 0x80 : 0))
    value = Math.floor(value / 128)
  } while (value > 0)
  return bytes
}

/**
 * The bitstream with geometry metadata inserted after its header: one entry whose value is `value`.
 * The header's 11 bytes are magic, version, encoder type and method, and flags (bit 15: metadata).
 */
export function withMetadata(bitstream: Uint8Array, value: Uint8Array): Uint8Array {
  const header = bitstream.slice(0, 11)
  header[9] |= 0x00
  header[10] |= 0x80
  const metadata = [...varint(0), ...varint(1), 3, ...new TextEncoder().encode('key'), ...varint(value.length), ...value, ...varint(0)]
  return Uint8Array.from([...header, ...metadata, ...bitstream.slice(11)])
}

/** The counts Google's reference decoder reads from a bitstream. */
export async function decodeDracoCounts(bitstream: Uint8Array): Promise<{ faces: number; points: number } | null> {
  const draco = await draco3d.createDecoderModule()
  const decoder = new draco.Decoder()
  const buffer = new draco.DecoderBuffer()
  buffer.Init(new Int8Array(bitstream.buffer, bitstream.byteOffset, bitstream.byteLength), bitstream.byteLength)
  const mesh = new draco.Mesh()
  try {
    const status = decoder.DecodeBufferToMesh(buffer, mesh)
    return status.ok() ? { faces: mesh.num_faces(), points: mesh.num_points() } : null
  } finally {
    draco.destroy(mesh)
    draco.destroy(buffer)
    draco.destroy(decoder)
  }
}

/** A raw Draco bitstream of a `size` × `size` grid, with the counts it encodes. */
export async function dracoBitstream(
  method: 'sequential' | 'edgebreaker',
  size: number
): Promise<{ bytes: Uint8Array; faces: number; points: number }> {
  const document = new Document()
  const buffer = document.createBuffer()
  const positions: number[] = []
  const indices: number[] = []
  for (let z = 0; z <= size; z++) for (let x = 0; x <= size; x++) positions.push(x, Math.sin(x) * 0.1, z)
  for (let z = 0; z < size; z++) {
    for (let x = 0; x < size; x++) {
      const a = z * (size + 1) + x
      indices.push(a, a + size + 1, a + 1, a + 1, a + size + 1, a + size + 2)
    }
  }
  const primitive = document
    .createPrimitive()
    .setAttribute('POSITION', document.createAccessor().setType('VEC3').setArray(new Float32Array(positions)).setBuffer(buffer))
    .setIndices(document.createAccessor().setType('SCALAR').setArray(new Uint32Array(indices)).setBuffer(buffer))
  document.createScene().addChild(document.createNode().setMesh(document.createMesh().addPrimitive(primitive)))
  document
    .createExtension(KHRDracoMeshCompression)
    .setRequired(true)
    .setEncoderOptions({
      method: method === 'sequential' ? KHRDracoMeshCompression.EncoderMethod.SEQUENTIAL : KHRDracoMeshCompression.EncoderMethod.EDGEBREAKER
    })
  const io = new NodeIO()
    .registerExtensions([KHRDracoMeshCompression])
    .registerDependencies({ 'draco3d.encoder': await draco3d.createEncoderModule() })
  const glb = await io.writeBinary(document)
  const view = new DataView(glb.buffer, glb.byteOffset)
  const jsonLength = view.getUint32(12, true)
  const json = JSON.parse(new TextDecoder().decode(glb.subarray(20, 20 + jsonLength)))
  const dracoView = json.bufferViews[json.meshes[0].primitives[0].extensions.KHR_draco_mesh_compression.bufferView]
  const binStart = 20 + jsonLength + 8 + (dracoView.byteOffset ?? 0)
  return { bytes: glb.slice(binStart, binStart + dracoView.byteLength), faces: size * size * 2, points: (size + 1) ** 2 }
}
