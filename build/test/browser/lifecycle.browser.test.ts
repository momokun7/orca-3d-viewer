// What happens over a frame's life: files saved again and again, bursts of saves, a lost GPU, and
// the resources each model leaves behind.
import assert from 'node:assert/strict'
import { after, afterEach, beforeEach, describe, it } from 'node:test'
import { dracoGlb, glb, triangleGltf } from '../fixtures/models.ts'
import { assertContained } from './frame-assertions.ts'
import { closeBrowser, type Frame, openFrame } from './harness.ts'

let frame: Frame
beforeEach(async () => {
  frame = await openFrame()
})
afterEach(() => frame.close())
after(closeBrowser)

async function screenshot(): Promise<Buffer> {
  return frame.page.locator('.viewport canvas').screenshot({ animations: 'disabled' })
}

describe('saving the file again', () => {
  it('reuses one WebGL context across many saves, so other tabs’ 3D views survive', async () => {
    // Stands in for another .glb tab in the same renderer process.
    await frame.page.evaluate(() => {
      const other = document.createElement('canvas').getContext('webgl2')
      ;(window as unknown as { __other: unknown }).__other = other
    })
    const heapAfterGc = (): Promise<number> =>
      frame.page.evaluate(() => {
        ;(window as unknown as { gc: () => void }).gc()
        return (performance as unknown as { memory: { usedJSHeapSize: number } }).memory.usedJSHeapSize
      })
    const draco = await dracoGlb()
    let baseline = 0
    for (let save = 0; save < 24; save++) {
      const bytes = save % 2 ? draco : glb(triangleGltf({ animationNames: [`Save ${save}`] }))
      assert.equal((await frame.open({ bytes })).kind, 'model')
      if (save === 3) baseline = await heapAfterGc()
    }
    const growth = (await heapAfterGc()) - baseline
    assert.ok(growth < 8 * 1024 * 1024, `the heap grew by ${growth} bytes over 20 saves`)
    const otherLost = await frame.page.evaluate(
      () => ((window as unknown as { __other: WebGL2RenderingContext }).__other).isContextLost()
    )
    assert.equal(otherLost, false)
    assert.equal(await frame.page.locator('canvas').count(), 1)
    const report = await frame.report()
    assert.deepEqual(report.console.filter(({ text }) => /too many active webgl contexts/i.test(text)), [])
    assertContained(report)
  })

  it('keeps the camera where the person left it when the same model is saved again', async () => {
    await frame.open({ bytes: glb(triangleGltf()) })
    const canvas = frame.page.locator('.viewport canvas')
    const box = await canvas.boundingBox()
    assert.ok(box)
    await frame.page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
    await frame.page.mouse.down()
    await frame.page.mouse.move(box.x + box.width / 2 + 120, box.y + box.height / 2 + 40, { steps: 5 })
    await frame.page.mouse.up()
    const orbited = await screenshot()
    await frame.open({ bytes: glb(triangleGltf()) })
    assert.ok(orbited.equals(await screenshot()), 'the view jumped back after a save')
    await frame.page.locator('button[aria-label="Reset view"]').click()
    assert.ok(!orbited.equals(await screenshot()), 'reset view did not move the camera')
    assertContained(await frame.report())
  })

  it('keeps wireframe on across a save', async () => {
    await frame.open({ bytes: glb(triangleGltf()) })
    await frame.page.locator('button[aria-label="Wireframe"]').click()
    await frame.open({ bytes: glb(triangleGltf()) })
    assert.equal(await frame.page.locator('button[aria-label="Wireframe"]').getAttribute('aria-pressed'), 'true')
  })

  it('ignores a resend of the version already on screen, whatever it carries', async () => {
    await frame.open({ bytes: glb(triangleGltf({ animationNames: ['First'] })) }, { version: 7 })
    await frame.open({ bytes: glb(triangleGltf({ animationNames: ['Resent'] })) }, { version: 7 })
    assert.equal(await frame.page.locator('.clip-name').innerText(), 'First')
  })

  it('keeps the last good model up when a later save cannot be shown, and says why', async () => {
    await frame.open({ bytes: glb(triangleGltf({ animationNames: ['Good'] })) })
    const half = await frame.open({ bytes: glb(triangleGltf()).slice(0, 40) })
    assert.equal(half.kind, 'model')
    assert.match(half.kind === 'model' ? (half.notice ?? '') : '', /latest save could not be shown.*cut short/)
    assert.equal(await frame.page.locator('.clip-name').innerText(), 'Good')
    const whole = await frame.open({ bytes: glb(triangleGltf({ animationNames: ['Whole'] })) })
    assert.equal(whole.kind === 'model' && whole.notice, null)
    assert.equal(await frame.page.locator('.clip-name').innerText(), 'Whole')
    assertContained(await frame.report())
  })

  it('settles on the last of a burst of saves, with one canvas', async () => {
    const draco = await dracoGlb()
    for (let version = 1; version <= 6; version++) {
      await frame.send({ bytes: version % 2 ? draco : glb(triangleGltf()) }, version)
    }
    await frame.send({ bytes: glb(triangleGltf({ animationNames: ['Last'] })) }, 7)
    const state = await frame.settled(7)
    assert.equal(state.kind, 'model')
    assert.equal(await frame.page.locator('.clip-name').innerText(), 'Last')
    assert.equal(await frame.page.locator('canvas').count(), 1)
    assertContained(await frame.report())
  })
})

describe('the GPU', () => {
  it('comes back by itself after the graphics driver resets', async () => {
    await frame.open({ bytes: glb(triangleGltf()) })
    await frame.page.evaluate(() => {
      const gl = document.querySelector('canvas')?.getContext('webgl2')
      const lose = gl?.getExtension('WEBGL_lose_context')
      ;(window as unknown as { __lose: unknown }).__lose = lose
      lose?.loseContext()
    })
    await frame.page.waitForFunction(() => document.querySelector<HTMLElement>('.toolbar')?.hidden === true)
    assert.match(await frame.page.locator('.overlay').innerText(), /graphics driver/)
    await frame.page.evaluate(() =>
      (window as unknown as { __lose: WEBGL_lose_context }).__lose.restoreContext()
    )
    await frame.page.waitForFunction(() => document.querySelector<HTMLElement>('.overlay')?.hidden === true)
    assert.equal((await frame.state())?.kind, 'model')
    assertContained(await frame.report())
  })

  it('says WebGL is unavailable instead of calling the file corrupt', async () => {
    const noGpu = await openFrame({ webgl: false })
    try {
      const state = await noGpu.open({ bytes: glb(triangleGltf()) })
      assert.match(state.kind === 'error' ? state.message : '', /needs WebGL/)
      const report = await noGpu.report()
      assert.ok(report.console.every(({ text }) => !text.startsWith('glTF Viewer: could not parse')))
    } finally {
      await noGpu.close()
    }
  })
})
