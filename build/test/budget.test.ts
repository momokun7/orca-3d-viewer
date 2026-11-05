import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import fc from 'fast-check'
import { BUDGET, gltfBudgetExcess } from '../src/gltf-budget.ts'
import { base64Source, bytesSource, imageSize } from '../src/image-dimensions.ts'
import { triangleGltf } from './fixtures/models.ts'
import { gifHeader, jpegHeader, ktx2Header, pngHeader, webpHeader } from './fixtures/images.ts'

const FUZZ_RUNS = Number(process.env.FUZZ_RUNS ?? 2000)

describe('imageSize', () => {
  it('reads the size of every image format glTF can carry from its header', () => {
    assert.deepEqual(imageSize(bytesSource(pngHeader(30_000, 20))), { width: 30_000, height: 20 })
    assert.deepEqual(imageSize(bytesSource(jpegHeader(640, 480))), { width: 640, height: 480 })
    assert.deepEqual(imageSize(bytesSource(webpHeader('VP8X', 9000, 300))), { width: 9000, height: 300 })
    assert.deepEqual(imageSize(bytesSource(webpHeader('VP8L', 1234, 77))), { width: 1234, height: 77 })
    assert.deepEqual(imageSize(bytesSource(ktx2Header(4096, 2048))), { width: 4096, height: 2048 })
    assert.deepEqual(imageSize(bytesSource(gifHeader(320, 200))), { width: 320, height: 200 })
  })

  it('reads a base64 data URI without decoding all of it', () => {
    const png = pngHeader(512, 256)
    const source = base64Source(Buffer.from(png).toString('base64'))
    assert.ok(source)
    assert.equal(source.length, png.length)
    assert.deepEqual(imageSize(source), { width: 512, height: 256 })
  })

  it('returns a size or null for arbitrary bytes and base64, never throwing or looping', () => {
    fc.assert(
      fc.property(fc.uint8Array({ maxLength: 512 }), fc.boolean(), (bytes, asBase64) => {
        const source = asBase64 ? base64Source(Buffer.from(bytes).toString('base64')) : bytesSource(bytes)
        const size = source && imageSize(source)
        assert.ok(size === null || (Number.isFinite(size.width) && Number.isFinite(size.height)))
      }),
      { numRuns: FUZZ_RUNS }
    )
  })
})

describe('gltfBudgetExcess', () => {
  it('accepts an ordinary model', () => {
    assert.equal(gltfBudgetExcess(triangleGltf({ animationNames: ['Walk'] }), null), null)
  })

  it('refuses a sparse accessor that declares gigabytes of zero-filled data', () => {
    const json = triangleGltf()
    json.accessors = [{ componentType: 5126, count: 100_000_000, type: 'VEC3', sparse: { count: 0 } }]
    assert.deepEqual(gltfBudgetExcess(json, null), {
      kind: 'accessorBytes',
      value: 1_200_000_000,
      limit: BUDGET.accessorBytes
    })
  })

  it('refuses an accessor that reads past its buffer view', () => {
    const json = triangleGltf()
    ;(json.accessors as Record<string, unknown>[])[0].count = 1000
    assert.deepEqual(gltfBudgetExcess(json, null), { kind: 'accessorOutOfRange', index: 0 })
  })

  it('refuses more nodes or draw calls than a frame can draw', () => {
    const many = triangleGltf()
    many.nodes = Array.from({ length: BUDGET.nodes + 1 }, () => ({}))
    assert.equal(gltfBudgetExcess(many, null)?.kind, 'nodes')
    const draws = triangleGltf()
    draws.nodes = Array.from({ length: BUDGET.drawCalls / 2 + 1 }, () => ({ mesh: 0 }))
    draws.meshes = [{ primitives: [{ attributes: { POSITION: 0 } }, { attributes: { POSITION: 0 } }] }]
    assert.equal(gltfBudgetExcess(draws, null)?.kind, 'drawCalls')
  })

  it('refuses an image that would decode to more pixels than allowed, from a data URI or the BIN chunk', () => {
    const json = triangleGltf()
    json.images = [{ uri: `data:image/png;base64,${Buffer.from(pngHeader(40_000, 40_000)).toString('base64')}` }]
    assert.equal(gltfBudgetExcess(json, null)?.kind, 'imageSide')

    const bin = pngHeader(20_000, 1)
    const fromBin = triangleGltf()
    fromBin.buffers = [{ byteLength: bin.length }]
    fromBin.bufferViews = [{ buffer: 0, byteOffset: 0, byteLength: bin.length }]
    fromBin.accessors = []
    fromBin.images = [{ bufferView: 0, mimeType: 'image/png' }]
    assert.equal(gltfBudgetExcess(fromBin, bin)?.kind, 'imageSide')
  })

  it('refuses many images that together exceed the pixel budget', () => {
    const json = triangleGltf()
    const image = `data:image/png;base64,${Buffer.from(pngHeader(16_000, 16_000)).toString('base64')}`
    json.images = [{ uri: image }]
    assert.equal(gltfBudgetExcess(json, null)?.kind, 'imagePixels')
  })

  it('never throws on arbitrary JSON', () => {
    fc.assert(
      fc.property(
        fc.dictionary(
          fc.constantFrom('accessors', 'bufferViews', 'buffers', 'nodes', 'meshes', 'images', '__proto__'),
          fc.jsonValue()
        ),
        (document) => {
          gltfBudgetExcess(document, null)
        }
      ),
      { numRuns: FUZZ_RUNS }
    )
  })
})
