import assert from 'node:assert/strict'
import { after, afterEach, beforeEach, describe, it } from 'node:test'
import { solidPng } from '../fixtures/images.ts'
import { reference, texturedSquare, triangle, usda, usdz } from '../fixtures/usd.ts'
import { crate, triangleSpecs } from '../fixtures/usdc.ts'
import { assertContained } from './frame-assertions.ts'
import { closeBrowser, type Content, openFrame, type Frame } from './harness.ts'

let frame: Frame
beforeEach(async () => {
  frame = await openFrame()
})
afterEach(() => frame.close())
after(closeBrowser)

const bytes = (fileType: string, data: Uint8Array): Content => ({ bytes: data, fileType })

describe('USD', () => {
  for (const [name, content, figures, notice] of [
    ['a USDZ in meters', bytes('.usdz', usdz([['model.usda', usda(triangle(), { metersPerUnit: 1 })]])), ['3 vertices · 1 triangle', '1 × 1 × 0 m'], null],
    ['a USDA with no unit, in centimetres', { text: usda(triangle()), fileType: '.usda' }, ['3 vertices · 1 triangle', '10 × 10 × 0 mm'], /centimeters/],
    [
      'a USDZ whose root references a layer in a folder twice',
      bytes('.usdz', usdz([['model.usda', usda(reference('Part', 'parts/part.usda', 2), { metersPerUnit: 1 })], ['parts/part.usda', usda(triangle(), { metersPerUnit: 1 })]])),
      ['6 vertices · 2 triangles', '1 × 1 × 0 m'],
      null
    ],
    ['a USDC in meters', bytes('usdc', crate(triangleSpecs({ metersPerUnit: 1 })).bytes), ['3 vertices · 1 triangle', '1 × 1 × 0 m'], null],
    ['a USDZ that holds a USDC', bytes('usdz', usdz([['model.usdc', crate(triangleSpecs({ metersPerUnit: 1 })).bytes]])), ['3 vertices · 1 triangle', '1 × 1 × 0 m'], null]
  ] as const) {
    it(`shows ${name}`, async () => {
      const state = await frame.open(content)
      assert.equal(state.kind, 'model', JSON.stringify(state))
      if (state.kind !== 'model') return
      assert.deepEqual(state.figures.slice(0, 2), figures)
      if (notice) assert.match(state.notice ?? '', notice)
      else assert.equal(state.notice, null)
      assertContained(await frame.report())
    })
  }

  it('shows the texture a package holds, and stays inside the frame', async () => {
    const files: [string, string | Uint8Array][] = [
      ['model.usda', usda(texturedSquare('tex.png'), { metersPerUnit: 1 })],
      ['tex.png', solidPng(64, 64, [0, 160, 0])]
    ]
    assert.equal((await frame.open(bytes('.usdz', usdz(files)))).kind, 'model')
    const box = await frame.page.locator('.viewport canvas').boundingBox()
    assert.ok(box)
    const [red, green, blue] = await frame.pixel(Math.round(box.x + box.width / 2), Math.round(box.y + box.height / 2))
    assert.ok(green > 100 && red < 100 && blue < 100, `expected green, got ${red}, ${green}, ${blue}`)
    assertContained(await frame.report())
  })

  it('names a texture outside the package without fetching it, and shows the surface in its place', async () => {
    const state = await frame.open({ text: usda(texturedSquare('https://example.com/wood.png'), { metersPerUnit: 1 }), fileType: '.usda' })
    assert.equal(state.kind, 'model', JSON.stringify(state))
    assert.match(state.kind === 'model' ? (state.notice ?? '') : '', /wood\.png.*\.usdz/)
    const box = await frame.page.locator('.viewport canvas').boundingBox()
    assert.ok(box)
    // Why off centre: the axis lines cross at the centre, and their colour mixes in on some GPUs.
    const [red, green, blue] = await frame.pixel(Math.round(box.x + box.width * 0.42), Math.round(box.y + box.height * 0.42))
    // Why not white: the stand-in pixel is taken out, so the viewer's blue-grey surface shows.
    assert.ok(blue > red + 20 && red < 200, `expected the blue-grey surface, got ${red}, ${green}, ${blue}`)
    assertContained(await frame.report())
  })

  for (const [name, content, message] of [
    ['a compressed package', bytes('.usdz', usdz([['model.usda', usda(triangle()).repeat(8)]], 6)), /compresses its files/],
    ['a damaged binary layer', bytes('usd', new TextEncoder().encode('PXR-USDC\0\0\0\0\0\0\0\0')), /cannot be read as USD/],
    ['layers that reference each other in a loop', bytes('.usdz', usdz([['a.usda', usda(reference('B', 'b.usda'))], ['b.usda', usda(reference('A', 'a.usda'))]])), /loop/]
  ] as const) {
    it(`refuses ${name} with a reason`, async () => {
      const state = await frame.open(content)
      assert.match(state.kind === 'error' ? state.message : JSON.stringify(state), message)
      assertContained(await frame.report())
    })
  }
})
