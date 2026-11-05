// Malformed and malicious models: the viewer must end in a model or an error message, every time,
// without running anything the file carries, polluting the page, or hanging.
import assert from 'node:assert/strict'
import { after, afterEach, beforeEach, describe, it } from 'node:test'
import fc from 'fast-check'
import { pngHeader } from '../fixtures/images.ts'
import { dracoGlb, embeddedGltfText, glb, TRIANGLE_BIN, triangleGltf } from '../fixtures/models.ts'
import { assertContained } from './frame-assertions.ts'
import { closeBrowser, type Content, type Frame, openFrame } from './harness.ts'

const FUZZ_RUNS = Number(process.env.FUZZ_RUNS ?? 40)
const FUZZ_SEED = process.env.FUZZ_SEED ? Number(process.env.FUZZ_SEED) : undefined
const DRACO_GLB = await dracoGlb()

const MARKUP_PAYLOADS = [
  '<img src=x onerror="window.__pwned=1">',
  '"><script>window.__pwned=1</script>',
  '<svg onload="window.__pwned=1">',
  '{{vertices}} {{__proto__}} {{constructor}}',
  '‮gnp.exe',
  'A'.repeat(10_000)
]

let frame: Frame
beforeEach(async () => {
  frame = await openFrame()
})
afterEach(() => frame.close())
after(closeBrowser)

async function assertNoInjection(): Promise<void> {
  const injected = await frame.page.evaluate(() => ({
    pwned: 'window.__pwned' in window || '__pwned' in window,
    elements: document.querySelectorAll('img, script:not([src]), svg [onload], iframe, object, embed').length
  }))
  assert.deepEqual(injected, { pwned: false, elements: 0 })
}

describe('markup in model fields', () => {
  it('shows clip names as text, never as markup, without direction overrides or unbounded length', async () => {
    const state = await frame.open({ bytes: glb(triangleGltf({ animationNames: MARKUP_PAYLOADS })) })
    assert.equal(state.kind, 'model')
    assert.deepEqual(state.kind === 'model' && state.animations, [
      ...MARKUP_PAYLOADS.slice(0, 4),
      'gnp.exe',
      `${'A'.repeat(79)}…`,
      'All clips'
    ])
    await assertNoInjection()
    assertContained(await frame.report())
  })

  it('shows a single clip name as text', async () => {
    await frame.open({ bytes: glb(triangleGltf({ animationNames: [MARKUP_PAYLOADS[0]] })) })
    assert.equal(await frame.page.locator('.clip-name').innerText(), MARKUP_PAYLOADS[0])
    await assertNoInjection()
  })

  it('shows external file names as text in the notice', async () => {
    const state = await frame.open({ bytes: glb(triangleGltf({ imageUris: MARKUP_PAYLOADS.slice(0, 3) })) })
    assert.ok(state.kind === 'model' && state.notice?.includes(`“${MARKUP_PAYLOADS[0]}”`))
    await assertNoInjection()
    assertContained(await frame.report())
  })
})

describe('malformed containers', () => {
  const header = (magic: number, version: number, chunkLength: number, chunkType: number): Uint8Array => {
    const bytes = new Uint8Array(28)
    const view = new DataView(bytes.buffer)
    view.setUint32(0, magic, true)
    view.setUint32(4, version, true)
    view.setUint32(8, bytes.byteLength, true)
    view.setUint32(12, chunkLength, true)
    view.setUint32(16, chunkType, true)
    return bytes
  }
  const cases: [string, { bytes: Uint8Array } | { text: string }][] = [
    ['an empty file', { bytes: new Uint8Array() }],
    ['an empty .gltf', { text: '' }],
    ['a GLB header with nothing after it', { bytes: glb(triangleGltf()).slice(0, 12) }],
    ['a JSON chunk longer than the file', { bytes: header(0x46546c67, 2, 0xffffffff, 0x4e4f534a) }],
    ['a first chunk that is not JSON', { bytes: header(0x46546c67, 2, 8, 0x004e4942) }],
    ['glTF version 1', { bytes: glb({ ...triangleGltf(), asset: { version: '1.0' } }) }],
    ['a JSON array', { text: '[]' }],
    ['invalid UTF-8 in the JSON chunk', { bytes: glb(triangleGltf()).map((byte, index) => (index === 25 ? 0xff : byte)) }],
    ['a .gltf of plain text', { text: 'solid cube\nendsolid cube' }],
    [
      'a Draco GLB whose compressed data is corrupt',
      { bytes: DRACO_GLB.map((byte, index) => (index > DRACO_GLB.length - 200 && index % 3 === 0 ? byte ^ 0x5a : byte)) }
    ]
  ]
  for (const [name, content] of cases) {
    it(`shows an error for ${name}`, async () => {
      const state = await frame.open(content)
      assert.equal(state.kind, 'error')
      assertContained(await frame.report(), { allowParseFailure: true, allowThreeLogs: true })
    })
  }

  for (const [name, bytes] of [
    ['a GLB missing the end of its BIN chunk', glb(triangleGltf()).slice(0, -20)],
    ['a Draco GLB cut in half', DRACO_GLB.slice(0, Math.floor(DRACO_GLB.length / 2))]
  ] as const) {
    it(`says ${name} is cut short, with both byte counts`, async () => {
      const state = await frame.open({ bytes })
      assert.equal(state.kind, 'error')
      assert.match(state.kind === 'error' ? state.message : '', new RegExp(`cut short: it has ${bytes.length.toLocaleString('en-US')} of`))
      assertContained(await frame.report())
    })
  }
})

describe('decompression bombs', () => {
  const refusedQuickly = async (content: Content, pattern: RegExp): Promise<void> => {
    const started = Date.now()
    const state = await frame.open(content)
    assert.match(state.kind === 'error' ? state.message : state.kind, pattern)
    assert.ok(Date.now() - started < 3000, `took ${Date.now() - started} ms`)
    const heap = await frame.page.evaluate(
      () => (performance as unknown as { memory?: { usedJSHeapSize: number } }).memory?.usedJSHeapSize ?? 0
    )
    assert.ok(heap < 200 * 1024 * 1024, `the heap grew to ${heap} bytes`)
    assertContained(await frame.report())
  }

  it('refuses a few hundred bytes that declare gigabytes of zero-filled vertices', async () => {
    const json = triangleGltf()
    json.accessors = [
      {
        componentType: 5126,
        count: 100_000_000,
        type: 'VEC3',
        min: [0, 0, 0],
        max: [1, 1, 1],
        sparse: { count: 1, indices: { bufferView: 1, componentType: 5125 }, values: { bufferView: 0 } }
      }
    ]
    json.meshes = [{ primitives: [{ attributes: { POSITION: 0 } }] }]
    await refusedQuickly({ bytes: glb(json) }, /too large to display safely: it would decode to 1\.12 GB/)
  })

  it('refuses an image whose header claims more pixels than any GPU can hold', async () => {
    const json = triangleGltf()
    json.images = [{ uri: `data:image/png;base64,${Buffer.from(pngHeader(60_000, 60_000)).toString('base64')}` }]
    json.textures = [{ source: 0 }]
    await refusedQuickly({ bytes: glb(json) }, /an image is 60,000 × 60,000 pixels/)
  })

  it('refuses hundreds of thousands of nodes that would stall every frame', async () => {
    const json = triangleGltf()
    json.nodes = Array.from({ length: 200_000 }, () => ({ mesh: 0 }))
    json.scenes = [{ nodes: Array.from({ length: 200_000 }, (_, index) => index) }]
    await refusedQuickly({ bytes: glb(json) }, /200,000 nodes/)
  })
})

describe('resource exhaustion', () => {
  it('refuses an accessor that claims far more data than its buffer holds', async () => {
    const json = triangleGltf()
    ;(json.accessors as Record<string, unknown>[])[0].count = 2 ** 31 - 1
    const started = Date.now()
    const state = await frame.open({ bytes: glb(json) })
    assert.equal(state.kind, 'error')
    assert.ok(Date.now() - started < 10_000)
    assertContained(await frame.report(), { allowParseFailure: true, allowThreeLogs: true })
  })

  it('survives JSON nested deeper than the parser allows', async () => {
    const deep = `{"asset":{"version":"2.0"},"extras":${'['.repeat(200_000)}${']'.repeat(200_000)}}`
    const state = await frame.open({ text: deep })
    assert.ok(state.kind === 'error' || state.kind === 'model')
    assertContained(await frame.report(), { allowParseFailure: true, allowThreeLogs: true })
  })

  it('handles a scene graph that refers to itself', async () => {
    const json = triangleGltf()
    json.nodes = [{ mesh: 0, children: [0] }]
    const state = await frame.open({ bytes: glb(json) })
    assert.ok(state.kind === 'error' || state.kind === 'model')
    assertContained(await frame.report(), { allowParseFailure: true, allowThreeLogs: true })
  })
})

describe('prototype pollution', () => {
  it('does not let __proto__ or constructor keys reach shared prototypes', async () => {
    const text = embeddedGltfText({ animationNames: ['Walk'] })
      .replace('{', '{"__proto__":{"polluted":1},"constructor":{"prototype":{"polluted":1}},')
      .replace('"nodes":[{', '"nodes":[{"__proto__":{"polluted":1},"extras":{"__proto__":{"polluted":1}},')
    const state = await frame.open({ text })
    assert.equal(state.kind, 'model')
    const polluted = await frame.page.evaluate(() => {
      const probe: Record<string, unknown> = {}
      return 'polluted' in probe || 'polluted' in Object.prototype
    })
    assert.equal(polluted, false)
    assertContained(await frame.report(), { allowThreeLogs: true })
  })
})

describe('structure three.js does not check', () => {
  it('calls a .gltf whose buffer has no URI corrupt, instead of crashing in the loader', async () => {
    const state = await frame.open({ text: JSON.stringify(triangleGltf()) })
    assert.match(state.kind === 'error' ? state.message : '', /corrupt/)
    assertContained(await frame.report())
  })

  it('calls a GLB whose second buffer has no URI corrupt', async () => {
    const json = triangleGltf()
    json.buffers = [{ byteLength: TRIANGLE_BIN.byteLength }, { byteLength: 4 }]
    const state = await frame.open({ bytes: glb(json) })
    assert.equal(state.kind, 'error')
    assertContained(await frame.report())
  })
})

describe('fuzzing', () => {
  const seeds = [glb(triangleGltf({ animationNames: ['Walk'] })), glb(triangleGltf({ imageUris: ['a.png'] }))]

  it('settles on a model or an error for randomly corrupted GLBs, and stays contained', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom(...seeds),
        fc.array(fc.tuple(fc.nat(), fc.integer({ min: 0, max: 255 })), { minLength: 1, maxLength: 16 }),
        fc.option(fc.nat()),
        async (seed, flips, cut) => {
          const bytes = seed.slice(0, cut === null ? seed.length : (cut % seed.length) + 1)
          for (const [at, value] of flips) bytes[at % bytes.length] = value
          const state = await frame.open({ bytes })
          assert.ok(state.kind === 'model' || state.kind === 'error')
          // Why inside the property: fast-check then reports the input that broke containment.
          assertContained(await frame.report(), { allowParseFailure: true, allowThreeLogs: true })
        }
      ),
      { numRuns: FUZZ_RUNS, seed: FUZZ_SEED }
    )
    await assertNoInjection()
    assertContained(await frame.report(), { allowParseFailure: true, allowThreeLogs: true })
  })

  it('settles on a model or an error for random glTF JSON', async () => {
    await fc.assert(
      fc.asyncProperty(fc.jsonValue({ maxDepth: 4 }), async (extras) => {
        const json = { ...triangleGltf(), extras, nodes: [{ mesh: 0, extras }] }
        const state = await frame.open({
          text: JSON.stringify({
            ...json,
            buffers: [
              {
                byteLength: TRIANGLE_BIN.byteLength,
                uri: `data:application/octet-stream;base64,${Buffer.from(TRIANGLE_BIN).toString('base64')}`
              }
            ]
          })
        })
        assert.equal(state.kind, 'model')
      }),
      { numRuns: FUZZ_RUNS, seed: FUZZ_SEED }
    )
    assertContained(await frame.report(), { allowThreeLogs: true })
  })
})
