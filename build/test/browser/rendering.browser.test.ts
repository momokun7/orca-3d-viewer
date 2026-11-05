import assert from 'node:assert/strict'
import { after, afterEach, beforeEach, describe, it } from 'node:test'
import {
  dracoGlb,
  embeddedGltfText,
  glb,
  GRID_VERTEX_COUNT,
  meshoptGlb,
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

describe('rendering', () => {
  it('shows a GLB with its vertex count, size and grid', async () => {
    const state = await frame.open({ bytes: glb(triangleGltf()) })
    assert.equal(state.kind, 'model')
    assert.deepEqual(state.kind === 'model' && state.figures, [
      '3 vertices · 1 triangles',
      '1 × 1 × 0 m',
      'Grid 0.1 m'
    ])
    assertContained(await frame.report())
  })

  it('decodes a Draco GLB under the frame CSP, fetching only the bundled decoder', async () => {
    const state = await frame.open({ bytes: await dracoGlb() })
    assert.equal(state.kind, 'model')
    assert.match(state.kind === 'model' ? state.figures[0] : '', new RegExp(`^${GRID_VERTEX_COUNT} vertices`))
    const report = await frame.report()
    assertContained(report)
    assert.ok(report.served.includes('editor/draco/draco_decoder.wasm'))
  })

  it('decodes a Meshopt GLB', async () => {
    const state = await frame.open({ bytes: await meshoptGlb() })
    assert.equal(state.kind, 'model')
    assertContained(await frame.report())
  })

  it('shows a .gltf whose data is embedded', async () => {
    const state = await frame.open({ text: embeddedGltfText({ animationNames: ['Walk', 'Run'] }) })
    assert.equal(state.kind, 'model')
    assert.deepEqual(state.kind === 'model' && state.animations, ['Walk', 'Run'])
    assertContained(await frame.report())
  })

  it('replaces the model when the file changes on disk, keeping one canvas', async () => {
    await frame.open({ bytes: glb(triangleGltf()) })
    await frame.open({ bytes: await dracoGlb() })
    assert.equal(await frame.page.locator('.viewport canvas').count(), 1)
    assertContained(await frame.report())
  })

  it('reports a lost WebGL context instead of a frozen view', async () => {
    await frame.open({ bytes: glb(triangleGltf()) })
    await frame.page.evaluate(() => {
      document.querySelector('canvas')?.getContext('webgl2')?.getExtension('WEBGL_lose_context')?.loseContext()
    })
    await frame.page.waitForFunction(() => document.querySelector<HTMLElement>('.toolbar')?.hidden === true)
    assert.match(await frame.page.locator('.overlay').innerText(), /graphics driver/)
    assertContained(await frame.report())
  })
})

describe('localization', () => {
  it('follows Orca’s locale rather than the operating system’s', async () => {
    const japanese = await openFrame({ locale: 'ja' })
    try {
      const state = await japanese.open({ bytes: glb(triangleGltf()) })
      assert.equal(state.kind === 'model' && state.figures[0], '3 頂点 · 1 三角形')
    } finally {
      await japanese.close()
    }
  })
})
