import { Document, NodeIO } from '@gltf-transform/core'
import { KHRDracoMeshCompression } from '@gltf-transform/extensions'
import draco3d from 'draco3dgltf'

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
