import assert from 'node:assert/strict'
import { after, afterEach, beforeEach, describe, it } from 'node:test'
import { solidPng } from '../fixtures/images.ts'
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
    assert.deepEqual(state.kind === 'model' && state.figures, ['3 vertices · 1 triangles', '1 × 1 × 0 m', 'Grid 0.1 m'])
    assertContained(await frame.report())
  })

  for (const embedding of ['bufferView', 'dataUri'] as const) {
    it(`draws a texture embedded as a ${embedding}, not the stand-in for blocked images`, async () => {
      const model = texturedQuad(solidPng(8, 8, [200, 0, 0]), embedding)
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
    assert.equal(state.kind === 'model' && state.figures[0], '3 vertices · 1 triangles')
    assertContained(await frame.report())
  })

  it('says which scene it shows when the file has several', async () => {
    const json = triangleGltf()
    json.scenes = [{ nodes: [0] }, { nodes: [] }, { nodes: [] }]
    const state = await frame.open({ bytes: glb(json) })
    assert.match(state.kind === 'model' ? (state.notice ?? '') : '', /2 more scene/)
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
        assert.equal((await odd.open({ bytes: glb(triangleGltf()).slice(0, -8) })).kind, 'error')
        assertContained(await odd.report())
      } finally {
        await odd.close()
      }
    })
  }
})
