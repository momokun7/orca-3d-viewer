import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import fc from 'fast-check'
import { base64Source, bytesSource, dataUriSource, MAX_PERCENT_ENCODED_CHARS } from '../src/byte-sources.ts'
import { dracoSize } from '../src/draco-header.ts'
import { BUDGET, gltfBudgetExcess } from '../src/gltf-budget.ts'
import { validateGltfStructure } from '../src/gltf-validation.ts'
import { imageSize } from '../src/image-dimensions.ts'
import { triangleGltf, type GltfJson } from './fixtures/models.ts'
import { avifHeader, bmpHeader, jpegHeader, ktx2Header, pngHeader, webpHeader } from './fixtures/images.ts'
import { dracoBitstream } from './fixtures/draco.ts'

const FUZZ_RUNS = Number(process.env.FUZZ_RUNS ?? 2000)
const FUZZ_SEED = process.env.FUZZ_SEED ? Number(process.env.FUZZ_SEED) : undefined
const base64Uri = (bytes: Uint8Array, mime = 'image/png'): string => `data:${mime};base64,${Buffer.from(bytes).toString('base64')}`

/** What the viewer does before parsing: validate, then budget. */
const check = (json: GltfJson, bin: Uint8Array | null = null): string | null => {
  const problem = validateGltfStructure(json, bin?.byteLength ?? null)
  if (problem) return `corrupt ${problem.path}`
  return gltfBudgetExcess(json, bin)?.kind ?? null
}

describe('imageSize', () => {
  it('reads the size of every image format glTF allows from its header', () => {
    assert.deepEqual(imageSize(bytesSource(pngHeader(30_000, 20))), { width: 30_000, height: 20 })
    assert.deepEqual(imageSize(bytesSource(jpegHeader(640, 480))), { width: 640, height: 480 })
    assert.deepEqual(imageSize(bytesSource(webpHeader('VP8X', 9000, 300))), { width: 9000, height: 300 })
    assert.deepEqual(imageSize(bytesSource(webpHeader('VP8L', 1234, 77))), { width: 1234, height: 77 })
    assert.deepEqual(imageSize(bytesSource(ktx2Header(4096, 2048))), { width: 4096, height: 2048 })
    assert.deepEqual(imageSize(bytesSource(avifHeader(8000, 6000))), { width: 8000, height: 6000 })
  })

  it('skips the stray bytes between JPEG segments that decoders skip too', () => {
    const jpeg = jpegHeader(30_000, 17_000)
    const junk = Uint8Array.from([...jpeg.subarray(0, 20), 0x00, 0x12, 0x34, 0xff, 0xff, ...jpeg.subarray(20)])
    assert.deepEqual(imageSize(bytesSource(junk)), { width: 30_000, height: 17_000 })
  })

  it('finds an AVIF size stored after a large media box', () => {
    assert.deepEqual(imageSize(bytesSource(avifHeader(20_000, 20_000, 200_000))), { width: 20_000, height: 20_000 })
  })

  it('has no size for formats glTF does not allow, so the caller refuses them', () => {
    assert.equal(imageSize(bytesSource(bmpHeader(30_000, 17_000))), null)
    assert.equal(imageSize(bytesSource(new TextEncoder().encode('GIF89a\x01\x00\x01\x00........................'))), null)
  })

  it('returns a size or null for arbitrary bytes and base64, never throwing or looping', () => {
    fc.assert(
      fc.property(fc.uint8Array({ maxLength: 512 }), fc.boolean(), (bytes, asBase64) => {
        const source = asBase64 ? base64Source(Buffer.from(bytes).toString('base64')) : bytesSource(bytes)
        const size = source && imageSize(source)
        assert.ok(size === null || (Number.isFinite(size.width) && Number.isFinite(size.height)))
      }),
      { numRuns: FUZZ_RUNS, seed: FUZZ_SEED }
    )
  })
})

describe('data: URI sources', () => {
  it('reads base64 lazily and percent-encoding as fetch() does', () => {
    const png = pngHeader(512, 256)
    assert.deepEqual(imageSize(dataUriSource(base64Uri(png))!), { width: 512, height: 256 })
    const percent = `data:image/png,${[...png].map((byte) => `%${byte.toString(16).padStart(2, '0')}`).join('')}`
    assert.deepEqual(imageSize(dataUriSource(percent)!), { width: 512, height: 256 })
  })

  it('refuses a percent-encoded payload too long to decode safely', () => {
    assert.equal(dataUriSource(`data:image/png,${'a'.repeat(MAX_PERCENT_ENCODED_CHARS + 1)}`), null)
  })
})

describe('dracoSize', () => {
  it('reads the face and point counts of both Draco methods, through metadata', async () => {
    for (const method of ['sequential', 'edgebreaker'] as const) {
      const { bytes, faces, points } = await dracoBitstream(method, 24)
      const size = dracoSize(bytesSource(bytes))
      assert.equal(size?.faces, faces, method)
      assert.ok(size && size.points >= points, method)
    }
  })

  it('has no size for bytes that are not Draco', () => {
    assert.equal(dracoSize(bytesSource(new TextEncoder().encode('DRACX\x02\x02\x01\x01\x00\x00'))), null)
    assert.equal(dracoSize(bytesSource(new Uint8Array(3))), null)
  })
})

describe('gltfBudgetExcess after validation', () => {
  it('accepts an ordinary model', () => {
    assert.equal(check(triangleGltf({ animationNames: ['Walk'] })), null)
  })

  it('refuses a sparse accessor that declares gigabytes of zero-filled data', () => {
    const json = triangleGltf()
    json.accessors = [
      { componentType: 5126, count: 100_000_000, type: 'VEC3', sparse: { count: 1, indices: { bufferView: 1, componentType: 5125 }, values: { bufferView: 0 } } }
    ]
    assert.equal(check(json), 'geometryBytes')
  })

  it('is not switched off by an accessor with an inherited or bogus type (the NaN bypass)', () => {
    for (const bogus of [{ type: 'constructor' }, { componentType: '__proto__' }, { count: Number.NaN }, { count: -1 }, { count: 1.5 }]) {
      const json = triangleGltf()
      ;(json.accessors as Record<string, unknown>[]).push({ componentType: 5126, type: 'SCALAR', count: 1, ...bogus })
      assert.match(check(json) ?? '', /^corrupt accessors\[3\]/, JSON.stringify(bogus))
    }
  })

  it('counts what Meshopt decodes to, and refuses a stream that claims another size', () => {
    const json = triangleGltf()
    const decoded = 2 ** 26 * 16
    json.buffers = [{ byteLength: 68 }, { byteLength: decoded, extensions: { EXT_meshopt_compression: { fallback: true } } }]
    json.bufferViews = [
      ...(json.bufferViews as unknown[]),
      { buffer: 1, byteLength: decoded, extensions: { EXT_meshopt_compression: { buffer: 0, byteLength: 64, count: 2 ** 26, byteStride: 16, mode: 'ATTRIBUTES' } } }
    ]
    assert.equal(check(json), 'geometryBytes')
    ;((json.bufferViews as Record<string, Record<string, Record<string, unknown>>>[])[3].extensions.EXT_meshopt_compression).count = 2 ** 20
    assert.match(check(json) ?? '', /^corrupt bufferViews\[3\]/)
  })

  it('reads Draco’s own header instead of trusting the accessor counts', () => {
    const json = triangleGltf()
    const draco = dracoHeaderClaiming(50_000_000)
    json.buffers = [{ byteLength: draco.length, uri: base64Uri(draco, 'application/octet-stream') }]
    json.bufferViews = [{ buffer: 0, byteLength: draco.length }]
    json.accessors = [{ componentType: 5126, count: 3, type: 'VEC3', min: [0, 0, 0], max: [1, 1, 1] }]
    json.meshes = [{ primitives: [{ attributes: { POSITION: 0 }, extensions: { KHR_draco_mesh_compression: { bufferView: 0, attributes: { POSITION: 0 } } } }] }]
    assert.equal(check(json), 'geometryBytes')
    json.buffers = [{ byteLength: 4, uri: base64Uri(new Uint8Array(4), 'application/octet-stream') }]
    json.bufferViews = [{ buffer: 0, byteLength: 4 }]
    assert.equal(check(json), 'unreadableDraco')
  })

  it('counts the GPU texture three.js builds for every morph target', () => {
    const json = triangleGltf()
    json.accessors = [{ componentType: 5126, count: 1_000_000, type: 'VEC3', sparse: { count: 1, indices: { bufferView: 1, componentType: 5125 }, values: { bufferView: 0 } } }]
    json.meshes = [{ primitives: [{ attributes: { POSITION: 0 }, targets: Array.from({ length: 100 }, () => ({ POSITION: 0 })) }] }]
    assert.equal(check(json), 'gpuBytes')
  })

  it('caps skin joints per skin and in all', () => {
    const json = triangleGltf()
    json.nodes = [{ mesh: 0 }, ...Array.from({ length: 5000 }, () => ({}))]
    json.skins = [{ joints: Array.from({ length: 5000 }, (_, index) => index + 1) }]
    assert.equal(check(json), 'skinJoints')
  })

  it('counts one GPU upload per image and sampler pair', () => {
    const json = triangleGltf()
    json.images = [{ uri: base64Uri(pngHeader(8192, 8192)) }]
    json.samplers = Array.from({ length: 4 }, (_, index) => ({ wrapS: 33071 + index }))
    json.textures = Array.from({ length: 4 }, (_, sampler) => ({ source: 0, sampler }))
    assert.equal(check(json), 'gpuBytes')
    json.textures = Array.from({ length: 4 }, () => ({ source: 0, sampler: 0 }))
    assert.equal(check(json), null)
  })

  it('refuses images whose size cannot be read rather than decoding them blind', () => {
    const json = triangleGltf()
    json.images = [{ uri: base64Uri(bmpHeader(30_000, 17_000), 'image/bmp') }]
    assert.equal(check(json), 'unreadableImage')
  })

  it('refuses an image that would decode to more pixels than any GPU holds', () => {
    const json = triangleGltf()
    json.images = [{ uri: base64Uri(pngHeader(40_000, 40_000)) }]
    assert.equal(check(json), 'imageSide')
  })

  it('refuses more nodes or draw calls than a frame can draw', () => {
    const many = triangleGltf()
    many.nodes = Array.from({ length: BUDGET.nodes + 1 }, () => ({}))
    assert.equal(check(many), 'nodes')
    const draws = triangleGltf()
    draws.nodes = Array.from({ length: BUDGET.drawCalls / 2 + 1 }, () => ({ mesh: 0 }))
    draws.meshes = [{ primitives: [{ attributes: { POSITION: 0 } }, { attributes: { POSITION: 0 } }] }]
    assert.equal(check(draws), 'drawCalls')
  })

  it('never throws, and never lets an invalid document reach the budget, for arbitrary JSON', () => {
    const keys = ['accessors', 'bufferViews', 'buffers', 'nodes', 'meshes', 'images', 'textures', 'skins', 'animations', '__proto__']
    fc.assert(
      fc.property(fc.dictionary(fc.constantFrom(...keys), fc.jsonValue()), (extra) => {
        const json = { ...triangleGltf(), ...extra }
        if (!validateGltfStructure(json, null)) gltfBudgetExcess(json, null)
      }),
      { numRuns: FUZZ_RUNS, seed: FUZZ_SEED }
    )
  })
})

/** A Draco sequential-mesh header that claims `faces` triangles and no data behind it. */
function dracoHeaderClaiming(faces: number): Uint8Array {
  const varint = (value: number): number[] => {
    const bytes: number[] = []
    do {
      bytes.push((value & 0x7f) | (value > 0x7f ? 0x80 : 0))
      value = Math.floor(value / 128)
    } while (value > 0)
    return bytes
  }
  return Uint8Array.from([...new TextEncoder().encode('DRACO'), 2, 2, 1, 0, 0, 0, ...varint(faces), ...varint(faces)])
}
