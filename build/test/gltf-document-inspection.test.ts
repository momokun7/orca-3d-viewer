import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  GLTF_DRACO_EXTENSION,
  glbTruncation,
  gltfExternalResources,
  gltfUsesExtension,
  readGltfDocument
} from '../src/gltf-document-inspection.ts'

function glbContainer(json: string): ArrayBuffer {
  const jsonBytes = new TextEncoder().encode(json.padEnd(Math.ceil(json.length / 4) * 4, ' '))
  const buffer = new ArrayBuffer(20 + jsonBytes.length)
  const view = new DataView(buffer)
  view.setUint32(0, 0x46546c67, true)
  view.setUint32(4, 2, true)
  view.setUint32(8, buffer.byteLength, true)
  view.setUint32(12, jsonBytes.length, true)
  view.setUint32(16, 0x4e4f534a, true)
  new Uint8Array(buffer, 20).set(jsonBytes)
  return buffer
}

describe('readGltfDocument', () => {
  it('reads the JSON chunk of a GLB and the text of a .gltf alike', () => {
    const json = JSON.stringify({ asset: { version: '2.0' } })
    assert.deepEqual(readGltfDocument(glbContainer(json)), { asset: { version: '2.0' } })
    assert.deepEqual(readGltfDocument(json), { asset: { version: '2.0' } })
  })

  it('rejects bytes that are not a GLB and text that is not a JSON object', () => {
    assert.equal(readGltfDocument(new TextEncoder().encode('not a model at all').buffer), null)
    assert.equal(readGltfDocument('[1, 2]'), null)
    assert.equal(readGltfDocument('{ broken'), null)
  })
})

describe('glbTruncation', () => {
  it('reports a GLB shorter than its header declares, and nothing for whole files or text', () => {
    const whole = glbContainer(JSON.stringify({ asset: { version: '2.0' } }))
    assert.equal(glbTruncation(whole), null)
    assert.deepEqual(glbTruncation(whole.slice(0, 24)), { declaredBytes: whole.byteLength, actualBytes: 24 })
    assert.equal(glbTruncation('{"asset":{}}'), null)
    assert.equal(glbTruncation(new ArrayBuffer(8)), null)
  })
})

describe('glTF document inspection', () => {
  it('splits external buffers from external images, skipping embedded data URIs', () => {
    const document = {
      buffers: [{ uri: 'mesh.bin' }, { uri: 'data:application/octet-stream;base64,AAAA' }],
      images: [{ uri: 'textures/albedo%20map.png' }, { uri: 'textures/albedo%20map.png' }, { bufferView: 0 }]
    }
    assert.deepEqual(gltfExternalResources(document), {
      buffers: ['mesh.bin'],
      images: ['textures/albedo%20map.png']
    })
  })

  it('detects Draco from either the used or the required extension list', () => {
    assert.equal(gltfUsesExtension({ extensionsUsed: [GLTF_DRACO_EXTENSION] }, GLTF_DRACO_EXTENSION), true)
    assert.equal(
      gltfUsesExtension({ extensionsRequired: [GLTF_DRACO_EXTENSION] }, GLTF_DRACO_EXTENSION),
      true
    )
    assert.equal(gltfUsesExtension({ extensionsUsed: 'nope' }, GLTF_DRACO_EXTENSION), false)
  })
})
