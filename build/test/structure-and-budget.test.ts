// What the structure check refuses and what the budget charges for each way three.js multiplies
// memory or work, one test per path an adversarial review found.
import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import fc from 'fast-check'
import { bytesSource } from '../src/byte-sources.ts'
import { BUDGET, gltfBudgetExcess } from '../src/gltf-budget.ts'
import { STRUCTURE_LIMITS, validateGltfStructure } from '../src/gltf-validation.ts'
import { imageSize } from '../src/image-dimensions.ts'
import { jpegHeader, solidKtx2 } from './fixtures/images.ts'
import { type GltfJson, TRIANGLE_BIN, triangleGltf } from './fixtures/models.ts'

const FUZZ_RUNS = Number(process.env.FUZZ_RUNS ?? 2000)
const FUZZ_SEED = process.env.FUZZ_SEED ? Number(process.env.FUZZ_SEED) : undefined

type Mutable = Record<string, any> // eslint-disable-line @typescript-eslint/no-explicit-any

const structure = (json: GltfJson): string | null => {
  const problem = validateGltfStructure(json, TRIANGLE_BIN.length)
  return problem && `${problem.path} ${problem.reason}`
}
const budget = (json: GltfJson): string | null => gltfBudgetExcess(json, TRIANGLE_BIN)?.kind ?? null

/** A zero-filled accessor of `count` elements: sparse with one value, so it needs no data. */
function zeroFilled(json: Mutable, count: number, type = 'VEC3', componentType = 5126): number {
  json.accessors.push({ componentType, type, count, sparse: { count: 1, indices: { bufferView: 1, componentType: 5125 }, values: { bufferView: 0 } } })
  return json.accessors.length - 1
}

describe('KTX2 headers', () => {
  const patch = (bytes: Uint8Array, at: number, value: number): Uint8Array => {
    const copy = bytes.slice()
    new DataView(copy.buffer).setUint32(at, value, true)
    return copy
  }

  it('accepts a single 2D image whose levels hold what its format implies', async () => {
    assert.deepEqual(imageSize(bytesSource(await solidKtx2(8, 8, [1, 2, 3]))), { width: 8, height: 8 })
  })

  it('refuses array layers, cube faces, depth and formats outside Basis and RGBA8', async () => {
    const ktx2 = await solidKtx2(8, 8, [1, 2, 3])
    for (const [field, at, value] of [
      ['layers', 32, 10_000],
      ['faces', 36, 6],
      ['depth', 28, 4],
      ['RGBA32F', 12, 109],
      ['supercompression', 44, 3],
      ['levels', 40, 20]
    ] as const) {
      assert.equal(imageSize(bytesSource(patch(ktx2, at, value))), null, field)
    }
  })

  it('refuses a level whose declared uncompressed size is not what 1×1 pixels hold', async () => {
    const ktx2 = await solidKtx2(1, 1, [1, 2, 3])
    // Level 0 starts at 80: byteOffset, byteLength, then uncompressedByteLength (u64).
    assert.equal(imageSize(bytesSource(patch(ktx2, 96, 1_500_000_000))), null)
  })
})

describe('image sniffing', () => {
  it('reads nothing as AVIF that Chromium would read as an icon, and needs an AVIF brand', () => {
    const icoThenBoxes = Uint8Array.from([0, 0, 1, 0, ...new TextEncoder().encode('ftypavif'), ...new Uint8Array(64)])
    assert.equal(imageSize(bytesSource(icoThenBoxes)), null)
    const heic = new Uint8Array(64)
    heic.set([0, 0, 0, 24, ...new TextEncoder().encode('ftypheic')])
    assert.equal(imageSize(bytesSource(heic)), null)
  })

  it('refuses a JPEG with more 0xFF fill than any encoder writes, quickly', () => {
    const jpeg = jpegHeader(30_000, 17_000)
    const filled = Uint8Array.from([...jpeg.subarray(0, 20), ...new Uint8Array(200_000).fill(0xff), ...jpeg.subarray(20)])
    const started = performance.now()
    assert.equal(imageSize(bytesSource(filled)), null)
    assert.ok(performance.now() - started < 200)
  })
})

describe('structure', () => {
  it('refuses accessors that are not aligned to their component size or overrun their stride', () => {
    const json = triangleGltf() as Mutable
    json.accessors[0].byteOffset = 2
    json.bufferViews[0].byteLength = 40
    assert.match(structure(json) ?? '', /aligned/)
    const strided = triangleGltf() as Mutable
    strided.bufferViews[0].byteStride = 8
    assert.match(structure(strided) ?? '', /stride/)
  })

  it('refuses POSITION bounds that are not finite and ordered', () => {
    for (const [min, max] of [
      [[0, 0, 0], [1, 1, Number.NaN]],
      [[0, 0, 0], [1, 1, 1e309]],
      [[2, 0, 0], [1, 1, 1]]
    ]) {
      const json = triangleGltf() as Mutable
      Object.assign(json.accessors[0], { min, max })
      assert.match(structure(json) ?? '', /POSITION bounds/, JSON.stringify([min, max]))
    }
  })

  it('checks EXT_mesh_gpu_instancing attributes: accessors, types and equal counts', () => {
    const json = triangleGltf() as Mutable
    const translation = zeroFilled(json, 4)
    const scale = zeroFilled(json, 5)
    json.nodes[0].extensions = { EXT_mesh_gpu_instancing: { attributes: { TRANSLATION: translation, SCALE: scale } } }
    assert.match(structure(json) ?? '', /different counts/)
    json.nodes[0].extensions.EXT_mesh_gpu_instancing.attributes = { TRANSLATION: zeroFilled(json, 4, 'SCALAR', 5121) }
    assert.match(structure(json) ?? '', /wrong type/)
    json.nodes[0].extensions.EXT_mesh_gpu_instancing.attributes = { TRANSLATION: 99 }
    assert.match(structure(json) ?? '', /not an accessor/)
  })

  it('checks animation samplers: float keyframes, outputs of the right type and count', () => {
    const json = triangleGltf({ animationNames: ['Walk'] }) as Mutable
    assert.equal(structure(json), null)
    json.accessors[1].componentType = 5121
    json.accessors[1].count = 2
    assert.match(structure(json) ?? '', /input that is not float/)
    const counts = triangleGltf({ animationNames: ['Walk'] }) as Mutable
    counts.animations[0].samplers[0].interpolation = 'CUBICSPLINE'
    assert.match(structure(counts) ?? '', /output counts/)
  })

  it('checks inverse bind matrices cover every joint, and light references and counts', () => {
    const json = triangleGltf() as Mutable
    json.nodes.push({})
    json.skins = [{ joints: [1], inverseBindMatrices: 0 }]
    assert.match(structure(json) ?? '', /MAT4 per joint/)
    const lit = triangleGltf() as Mutable
    lit.nodes[0].extensions = { KHR_lights_punctual: { light: 0 } }
    assert.match(structure(lit) ?? '', /not a light/)
    lit.extensions = { KHR_lights_punctual: { lights: Array.from({ length: STRUCTURE_LIMITS.lights + 1 }, () => ({ type: 'point' })) } }
    assert.match(structure(lit) ?? '', /has more than/)
  })
})

describe('budget multipliers', () => {
  it('charges instance matrices and the vertices instancing draws', () => {
    const json = triangleGltf() as Mutable
    const position = zeroFilled(json, 1_000_000)
    json.meshes = [{ primitives: [{ attributes: { POSITION: position } }] }]
    json.nodes[0].extensions = { EXT_mesh_gpu_instancing: { attributes: { TRANSLATION: zeroFilled(json, 1000) } } }
    assert.equal(structure(json), null)
    assert.equal(budget(json), 'drawnVertices')
    json.meshes = [{ primitives: [{ attributes: { POSITION: 0 } }] }]
    json.nodes[0].extensions.EXT_mesh_gpu_instancing.attributes.TRANSLATION = zeroFilled(json, 9_000_000)
    assert.equal(budget(json), 'geometryBytes')
  })

  it('charges keyframes once per channel, as three.js copies them', () => {
    const json = triangleGltf({ animationNames: ['Walk'] }) as Mutable
    const input = zeroFilled(json, 3_000_000, 'SCALAR')
    const output = zeroFilled(json, 3_000_000)
    json.animations[0].samplers = [{ input, output }]
    json.animations[0].channels = Array.from({ length: 12 }, () => ({ sampler: 0, target: { node: 0, path: 'translation' } }))
    assert.equal(structure(json), null)
    assert.equal(budget(json), 'geometryBytes')
  })

  it('charges a strided view’s whole interleaved copy per accessor that reads it', () => {
    const json = triangleGltf() as Mutable
    json.buffers.push({ byteLength: 252 * 1_100_000, uri: 'data:,' })
    json.bufferViews.push({ buffer: 1, byteLength: 252 * 1_100_000, byteStride: 252 })
    json.accessors.push(
      ...Array.from({ length: 3 }, (_, index) => ({ bufferView: 3, componentType: 5121, type: 'SCALAR', count: 1_100_000 - index }))
    )
    json.meshes[0].primitives = [3, 4, 5].map((accessor) => ({ attributes: { POSITION: 0, _DATA: accessor } }))
    assert.equal(structure(json), null)
    assert.equal(budget(json), 'geometryBytes')
  })

  it('charges strips and fans for the triangle lists they become', () => {
    const json = triangleGltf() as Mutable
    const indices = zeroFilled(json, 30_000_000, 'SCALAR', 5125)
    json.meshes[0].primitives[0] = { attributes: { POSITION: 0 }, indices, mode: 5 }
    assert.equal(structure(json), null)
    assert.equal(budget(json), 'geometryBytes')
  })

  it('stops checking and refuses when checking itself would freeze the frame', () => {
    const json = triangleGltf() as Mutable
    json.images = Array.from({ length: 64 }, () => ({ uri: `data:image/jpeg;base64,${Buffer.from(jpegHeader(8, 8)).toString('base64')}` }))
    assert.equal(gltfBudgetExcess(json, TRIANGLE_BIN, -1)?.kind, 'tooComplex')
  })
})

describe('structured fuzzing', () => {
  // Paths to numeric fields of a valid document; the fuzzer rewrites one or more of them.
  const NUMERIC_FIELDS = [
    'accessors.0.count',
    'accessors.0.byteOffset',
    'accessors.0.componentType',
    'accessors.1.count',
    'accessors.2.count',
    'bufferViews.0.byteLength',
    'bufferViews.0.byteOffset',
    'bufferViews.0.byteStride',
    'bufferViews.1.buffer',
    'buffers.0.byteLength',
    'meshes.0.primitives.0.mode',
    'meshes.0.primitives.0.attributes.POSITION',
    'nodes.0.mesh',
    'animations.0.samplers.0.input',
    'animations.0.samplers.0.output',
    'animations.0.channels.0.target.node'
  ]

  it('never throws, and the budget only ever sees structurally valid documents', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.tuple(
            fc.constantFrom(...NUMERIC_FIELDS),
            fc.oneof(fc.integer({ min: -2, max: 8 }), fc.constantFrom(2 ** 31, 2 ** 53, 1.5, Number.NaN, 5120, 5126, 252))
          ),
          { minLength: 1, maxLength: 4 }
        ),
        (mutations) => {
          const json = triangleGltf({ animationNames: ['Walk'] }) as Mutable
          for (const [path, value] of mutations) {
            const keys = path.split('.')
            const parent = keys.slice(0, -1).reduce((node, key) => node?.[key], json)
            if (parent) parent[keys.at(-1)!] = value
          }
          if (validateGltfStructure(json, TRIANGLE_BIN.length) === null) {
            const excess = gltfBudgetExcess(json, TRIANGLE_BIN)
            assert.ok(excess === null || typeof excess.kind === 'string')
          }
        }
      ),
      { numRuns: FUZZ_RUNS, seed: FUZZ_SEED }
    )
  })
})

assert.ok(BUDGET.drawnVertices > 0)
