import assert from 'node:assert/strict'
import { after, afterEach, beforeEach, describe, it } from 'node:test'
import { solidKtx2, solidPng } from '../fixtures/images.ts'
import {
  dracoGlb,
  embeddedGltfText,
  glb,
  GRID_VERTEX_COUNT,
  khrMeshoptGlb,
  meshoptGlb,
  pointCloudGlb,
  scenelessGlb,
  texturedQuad,
  triangleGltf
} from '../fixtures/models.ts'
import { assertContained } from './frame-assertions.ts'
import { closeBrowser, type Frame, openFrame } from './harness.ts'

let frame: Frame
beforeEach(async () => {
  frame = await openFrame()
})
afterEach(() => frame.close())
after(closeBrowser)

// The canvas centre in CSS pixels: the stage fills the page above the toolbar.
async function canvasCentre(): Promise<[number, number]> {
  const box = await frame.page.locator('.viewport canvas').boundingBox()
  assert.ok(box)
  return [Math.round(box.x + box.width / 2), Math.round(box.y + box.height / 2)]
}

describe('rendering', () => {
  it('shows a GLB with its vertex count, size and grid', async () => {
    const state = await frame.open({ bytes: glb(triangleGltf()) })
    assert.equal(state.kind, 'model')
    assert.deepEqual(state.kind === 'model' && state.figures, ['3 vertices · 1 triangle', '1 × 1 × 0 m', 'Grid 0.1 m'])
    assertContained(await frame.report())
  })

  it('opens light whatever Orca’s theme, and the toolbar switches it to dark and back', async () => {
    await frame.page.evaluate(() => {
      document.head.append(Object.assign(document.createElement('style'), { textContent: ':root{--orca-background:#0a0a0a}' }))
    })
    await frame.open({ bytes: glb(triangleGltf()) })
    const background = () => frame.page.evaluate(() => getComputedStyle(document.body).backgroundColor)
    const toggle = frame.page.locator('button[aria-label="Dark theme"]')
    assert.equal(await background(), 'rgb(255, 255, 255)')
    await toggle.click()
    assert.equal(await toggle.getAttribute('aria-pressed'), 'true')
    assert.equal(await background(), 'rgb(10, 10, 10)')
    await toggle.click()
    assert.equal(await background(), 'rgb(255, 255, 255)')
  })

  it('reopens with the theme, wireframe and guides last chosen, ignoring a malformed record', async () => {
    const pressed = () =>
      frame.page.evaluate(() =>
        ['Dark theme', 'Wireframe', 'Grid and axes'].map((label) =>
          document.querySelector(`button[aria-label="${label}"]`)?.getAttribute('aria-pressed')
        )
      )
    await frame.open({ bytes: glb(triangleGltf()) })
    for (const label of ['Dark theme', 'Wireframe', 'Grid and axes']) {
      await frame.page.locator(`button[aria-label="${label}"]`).click()
    }
    await frame.page.reload()
    await frame.open({ bytes: glb(triangleGltf()) })
    assert.deepEqual(await pressed(), ['true', 'true', 'false'])
    assert.equal(await frame.page.evaluate(() => document.documentElement.classList.contains('dark')), true)

    await frame.page.evaluate(() => localStorage.setItem('viewer-preferences', '{"dark":"yes","__proto__":{"wireframe":true}}'))
    await frame.page.reload()
    await frame.open({ bytes: glb(triangleGltf()) })
    assert.deepEqual(await pressed(), ['false', 'false', 'true'])
  })

  for (const [format, embedding] of [
    ['PNG', 'bufferView'],
    ['PNG', 'dataUri'],
    ['KTX2', 'bufferView'],
    ['KTX2', 'dataUri']
  ] as const) {
    it(`draws a ${format} texture embedded as a ${embedding}, not the stand-in for blocked images`, async () => {
      const image = format === 'PNG' ? solidPng(8, 8, [200, 0, 0]) : await solidKtx2(8, 8, [200, 0, 0])
      const model = texturedQuad(image, embedding, { ktx2: format === 'KTX2' })
      const state = await frame.open(typeof model === 'string' ? { text: model } : { bytes: model })
      assert.equal(state.kind, 'model')
      const [r, g, b] = await frame.pixel(...(await canvasCentre()))
      assert.ok(r > 150 && g < 60 && b < 60, `expected the red texture, got rgb(${r}, ${g}, ${b})`)
      assertContained(await frame.report())
    })
  }

  it('decodes a Draco GLB under the frame CSP, fetching only the bundled decoder', async () => {
    const state = await frame.open({ bytes: await dracoGlb() })
    assert.equal(state.kind, 'model')
    assert.match(state.kind === 'model' ? state.figures[0] : '', new RegExp(`^${GRID_VERTEX_COUNT} vertices`))
    const report = await frame.report()
    assertContained(report)
    assert.ok(report.served.includes('editor/draco/draco_decoder.wasm'))
  })

  it('decodes Meshopt GLBs under both the EXT_ and the ratified KHR_ extension name', async () => {
    for (const model of [await meshoptGlb(), await khrMeshoptGlb()]) {
      const state = await frame.open({ bytes: model })
      assert.equal(state.kind, 'model')
    }
    assertContained(await frame.report())
  })

  it('shows a .gltf whose data is embedded, offering every clip and all of them together', async () => {
    const state = await frame.open({ text: embeddedGltfText({ animationNames: ['Walk', 'Run'] }) })
    assert.equal(state.kind, 'model')
    assert.deepEqual(state.kind === 'model' && state.animations, ['Walk', 'Run', 'All clips'])
    await frame.page.locator('select').selectOption({ label: 'All clips' })
    assertContained(await frame.report())
  })

  it('counts a point cloud’s points instead of reporting an empty model', async () => {
    const state = await frame.open({ bytes: pointCloudGlb() })
    assert.equal(state.kind === 'model' && state.figures[0], '3 vertices · 0 triangles · 3 points')
    assertContained(await frame.report())
  })

  it('shows every root node of a file that has no scenes', async () => {
    const state = await frame.open({ bytes: scenelessGlb() })
    assert.equal(state.kind === 'model' && state.figures[0], '3 vertices · 1 triangle')
    assertContained(await frame.report())
  })

  it('reports no size, rather than a made-up one, for a model with no geometry', async () => {
    const json = triangleGltf()
    json.nodes = [{ name: 'empty' }]
    const state = await frame.open({ bytes: glb(json) })
    assert.equal(state.kind === 'model' && state.figures[1], '0 × 0 × 0 m')
    assertContained(await frame.report())
  })

  it('says which scene it shows when the file has several', async () => {
    const json = triangleGltf()
    json.scenes = [{ nodes: [0] }, { nodes: [] }, { nodes: [] }]
    const state = await frame.open({ bytes: glb(json) })
    assert.match(state.kind === 'model' ? (state.notice ?? '') : '', /2 more scenes; the default/)
    assertContained(await frame.report())
  })

  it('names the extension it cannot read instead of calling the file corrupt', async () => {
    const json = { ...triangleGltf(), extensionsUsed: ['KHR_gaussian_splatting'], extensionsRequired: ['KHR_gaussian_splatting'] }
    const state = await frame.open({ bytes: glb(json) })
    assert.match(state.kind === 'error' ? state.message : '', /extensions the viewer does not support: “KHR_gaussian_splatting”/)
    assertContained(await frame.report())
  })

  it('reads a .gltf saved with a byte-order mark', async () => {
    const state = await frame.open({ text: `﻿${embeddedGltfText()}` })
    assert.equal(state.kind, 'model')
    assertContained(await frame.report())
  })
})

describe('localization', () => {
  it('follows Orca’s locale rather than the operating system’s', async () => {
    const japanese = await openFrame({ locale: 'ja' })
    try {
      const state = await japanese.open({ bytes: glb(triangleGltf()) })
      assert.equal(state.kind === 'model' && state.figures[0], '3 頂点 · 1 三角形')
      assert.equal(await japanese.page.evaluate(() => document.documentElement.lang), 'ja')
    } finally {
      await japanese.close()
    }
  })

  for (const locale of ['ja_JP', '', 'not a locale!']) {
    it(`still shows models when Orca reports the locale ${JSON.stringify(locale)}`, async () => {
      const odd = await openFrame({ locale })
      try {
        assert.equal((await odd.open({ bytes: glb(triangleGltf()) })).kind, 'model')
        const cut = await odd.open({ bytes: glb(triangleGltf()).slice(0, -8) })
        assert.match(cut.kind === 'model' ? (cut.notice ?? '') : '', /cut short|途中で切れて/)
        assertContained(await odd.report())
      } finally {
        await odd.close()
      }
    })
  }
})
