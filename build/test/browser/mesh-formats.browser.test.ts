import assert from 'node:assert/strict'
import { after, afterEach, beforeEach, describe, it } from 'node:test'
import { deflateSync } from 'node:zlib'
import fc from 'fast-check'
import { solidPng } from '../fixtures/images.ts'
import { asciiPly, asciiStl, binaryPly, binaryStl, fbxTexturedSquare, fbxTriangle, obj } from '../fixtures/meshes.ts'
import { assertContained } from './frame-assertions.ts'
import { closeBrowser, type Content, type Frame, openFrame } from './harness.ts'

let frame: Frame
beforeEach(async () => {
  frame = await openFrame()
})
afterEach(() => frame.close())
after(closeBrowser)

const bytes = (fileType: string, data: Uint8Array | string): Content => ({
  bytes: typeof data === 'string' ? new TextEncoder().encode(data) : data,
  fileType
})

describe('STL, PLY, OBJ and FBX', () => {
  for (const [name, content, size, notice] of [
    ['a binary STL, in millimetres and Z-up', bytes('.stl', binaryStl()), '1 × 0 × 1 mm', null],
    ['a text STL', bytes('.stl', asciiStl()), '1 × 0 × 1 mm', null],
    ['a text PLY, in meters', bytes('.ply', asciiPly()), '1 × 1 × 0 m', /no unit/],
    ['a binary PLY', bytes('.ply', binaryPly()), '1 × 1 × 0 m', /no unit/],
    ['an OBJ', { text: obj(), fileType: '.obj' }, '1 × 1 × 0 m', /no unit/],
    ['an FBX in its own unit, centimetres', bytes('.fbx', fbxTriangle({ compress: true })), '10 × 10 × 0 mm', null],
    ['an FBX in meters', bytes('.fbx', fbxTriangle({ unitScale: 100, version: 7500 })), '1 × 1 × 0 m', null]
  ] as const) {
    it(`shows ${name} with its size`, async () => {
      const state = await frame.open(content)
      assert.equal(state.kind, 'model', JSON.stringify(state))
      if (state.kind !== 'model') return
      assert.deepEqual(state.figures.slice(0, 2), ['3 vertices · 1 triangle', size])
      if (notice) assert.match(state.notice ?? '', notice)
      else assert.equal(state.notice, null)
      assertContained(await frame.report())
    })
  }

  it('shows an FBX texture that finishes loading after the parse', async () => {
    // Why large: a big image decodes after FBXLoader returns, which is what left textures blank.
    const state = await frame.open(bytes('.fbx', fbxTexturedSquare(solidPng(2048, 2048, [0, 160, 0]))))
    assert.equal(state.kind, 'model')
    const box = await frame.page.locator('.viewport canvas').boundingBox()
    assert.ok(box)
    const [red, green, blue] = await frame.pixel(Math.round(box.x + box.width / 2), Math.round(box.y + box.height / 2))
    assert.ok(green > 100 && red < 100 && blue < 100, `expected green, got ${red}, ${green}, ${blue}`)
    assertContained(await frame.report())
  })

  it('says an OBJ material file is not shown', async () => {
    const state = await frame.open({ text: `mtllib chair.mtl\nusemtl Fabric\n${obj()}`, fileType: '.obj' })
    assert.equal(state.kind, 'model')
    assert.match(state.kind === 'model' ? (state.notice ?? '') : '', /\.mtl/)
  })

  it('refuses an FBX array that inflates past its declared length, with the reason', async () => {
    const bomb = new Uint8Array(deflateSync(new Uint8Array(32 * 1024 * 1024)))
    const file = fbxTriangle({ geometryChildren: [{ name: 'Normals', properties: [{ type: 'd', value: [0, 0, 1], raw: bomb }] }] })
    const state = await frame.open(bytes('.fbx', file))
    assert.equal(state.kind, 'error')
    assert.match(state.kind === 'error' ? state.message : '', /FBX.*inflates past/)
    assertContained(await frame.report())
  })

  it('names an old FBX version instead of calling the file corrupt', async () => {
    const state = await frame.open(bytes('.fbx', fbxTriangle({ version: 6100 })))
    assert.equal(state.kind, 'error')
    assert.match(state.kind === 'error' ? state.message : '', /version 6100/)
  })
})

describe('fuzzing STL, PLY, OBJ and FBX', () => {
  const FUZZ_RUNS = Number(process.env.FUZZ_RUNS ?? 40)
  const FUZZ_SEED = process.env.FUZZ_SEED ? Number(process.env.FUZZ_SEED) : undefined
  const seeds: [string, Uint8Array][] = [
    ['.stl', binaryStl()],
    ['.ply', binaryPly()],
    ['.ply', new TextEncoder().encode(asciiPly())],
    ['.obj', new TextEncoder().encode(obj())],
    ['.fbx', fbxTriangle({ compress: true })]
  ]

  it('settles on a model or an error for randomly corrupted files, and stays contained', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom(...seeds),
        fc.array(fc.tuple(fc.nat(), fc.integer({ min: 0, max: 255 })), { minLength: 1, maxLength: 16 }),
        fc.option(fc.nat()),
        async ([fileType, seed], flips, cut) => {
          const data = seed.slice(0, cut === null ? seed.length : (cut % seed.length) + 1)
          for (const [at, value] of flips) data[at % data.length] = value
          const content: Content = fileType === '.obj' ? { text: new TextDecoder().decode(data), fileType } : { bytes: data, fileType }
          const state = await frame.open(content)
          assert.ok(state.kind === 'model' || state.kind === 'error')
          assertContained(await frame.report(), { allowParseFailure: true, allowThreeLogs: true })
        }
      ),
      { numRuns: FUZZ_RUNS, seed: FUZZ_SEED }
    )
  })
})
