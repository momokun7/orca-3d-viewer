// Malformed and malicious models: the viewer must end in a model or an error message, every time,
// without running anything the file carries, polluting the page, or hanging.
import assert from 'node:assert/strict'
import { after, afterEach, beforeEach, describe, it } from 'node:test'
import fc from 'fast-check'
import { dracoGlb, glb, TRIANGLE_BIN, triangleGltf } from '../fixtures/models.ts'
import { assertContained } from './frame-assertions.ts'
import { closeBrowser, type Frame, openFrame } from './harness.ts'

const FUZZ_RUNS = Number(process.env.FUZZ_RUNS ?? 40)
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
  it('shows clip names as text, never as markup', async () => {
    const state = await frame.open({ bytes: glb(triangleGltf({ animationNames: MARKUP_PAYLOADS })) })
    assert.equal(state.kind, 'model')
    assert.deepEqual(state.kind === 'model' && state.animations, MARKUP_PAYLOADS)
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
    assert.ok(state.kind === 'model' && state.notice?.includes(MARKUP_PAYLOADS[0]))
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
      assertContained(await frame.report(), { allowParseFailure: true })
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

describe('resource exhaustion', () => {
  it('refuses an accessor that claims far more data than its buffer holds', async () => {
    const json = triangleGltf()
    ;(json.accessors as Record<string, unknown>[])[0].count = 2 ** 31 - 1
    const started = Date.now()
    const state = await frame.open({ bytes: glb(json) })
    assert.equal(state.kind, 'error')
    assert.ok(Date.now() - started < 10_000)
    assertContained(await frame.report(), { allowParseFailure: true })
  })

  it('survives JSON nested deeper than the parser allows', async () => {
    const deep = `{"asset":{"version":"2.0"},"extras":${'['.repeat(200_000)}${']'.repeat(200_000)}}`
    const state = await frame.open({ text: deep })
    assert.ok(state.kind === 'error' || state.kind === 'model')
    assertContained(await frame.report(), { allowParseFailure: true })
  })

  it('handles a scene graph that refers to itself', async () => {
    const json = triangleGltf()
    json.nodes = [{ mesh: 0, children: [0] }]
    const state = await frame.open({ bytes: glb(json) })
    assert.ok(state.kind === 'error' || state.kind === 'model')
    assertContained(await frame.report(), { allowParseFailure: true })
  })
})

describe('prototype pollution', () => {
  it('does not let __proto__ or constructor keys reach shared prototypes', async () => {
    const text = JSON.stringify(triangleGltf()).replace(
      '{',
      '{"__proto__":{"polluted":1},"constructor":{"prototype":{"polluted":1}},'
    )
    await frame.open({ text: text.replace('"nodes":[{', '"nodes":[{"__proto__":{"polluted":1},') })
    const polluted = await frame.page.evaluate(() => {
      const probe: Record<string, unknown> = {}
      return 'polluted' in probe || 'polluted' in Object.prototype
    })
    assert.equal(polluted, false)
    assertContained(await frame.report(), { allowParseFailure: true })
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
        }
      ),
      { numRuns: FUZZ_RUNS }
    )
    await assertNoInjection()
    assertContained(await frame.report(), { allowParseFailure: true })
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
      { numRuns: FUZZ_RUNS }
    )
    assertContained(await frame.report())
  })
})
