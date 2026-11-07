import assert from 'node:assert/strict'
import { after, afterEach, beforeEach, describe, it } from 'node:test'
import { fbxTriangle } from '../fixtures/meshes.ts'
import { glb, triangleGltf } from '../fixtures/models.ts'
import { closeBrowser, type Frame, openFrame } from './harness.ts'

let frame: Frame
beforeEach(async () => {
  frame = await openFrame()
})
afterEach(() => frame.close())
after(closeBrowser)

const SECRET = 'Client-Project-Codename'

async function detailsText(opener: string): Promise<string> {
  await frame.page.locator(opener).click()
  const text = frame.page.locator('.details-text')
  await text.waitFor()
  return text.inputValue()
}

describe('Details panel', () => {
  it('reports the viewer, the load and its outcome, but no names from the model', async () => {
    const gltf = triangleGltf({ animationNames: [SECRET] })
    const named = {
      ...gltf,
      nodes: [{ mesh: 0, name: SECRET }],
      materials: [{ name: SECRET }],
      extensionsUsed: ['KHR_materials_unlit']
    }
    await frame.open({ bytes: glb(named) })
    const text = await detailsText('button[aria-label="Details"]')
    assert.match(text, /^3D Viewer \d+\.\d+\.\d+$/m)
    assert.match(text, /GLTF .*check \d+ ms, parse \d+ ms, show \d+ ms, shown: 3 vertices, 1 triangles/)
    assert.match(text, /extensions KHR_materials_unlit/)
    assert.match(text, /Graphics: \S/)
    assert.doesNotMatch(text, new RegExp(SECRET))
  })

  it('opens from an error screen and says why the file was refused', async () => {
    const state = await frame.open({ bytes: fbxTriangle({ version: 6100 }), fileType: '.fbx' })
    assert.equal(state.kind, 'error')
    const text = await detailsText('.overlay .text-button')
    assert.match(text, /FBX .*check \d+ ms, refused \{"kind":"fbxVersion","version":6100\}\n {4}message: This FBX file is version 6100/)
  })

  it('keeps the errors the viewer met, with their type', async () => {
    await frame.page.evaluate(() => setTimeout(() => {
      throw new TypeError('a test failure')
    }))
    await frame.open({ bytes: glb(triangleGltf()) })
    const text = await detailsText('button[aria-label="Details"]')
    assert.match(text, /uncaught: TypeError: a test failure/)
  })

  it('copies the text with a click, and closes with Escape', async () => {
    await frame.open({ bytes: glb(triangleGltf()) })
    await detailsText('button[aria-label="Details"]')
    await frame.page.locator('.details .text-button', { hasText: 'Copy' }).click()
    assert.match(await frame.page.locator('.copy-status').innerText(), /Copied|Select the text/)
    await frame.page.keyboard.press('Escape')
    assert.equal(await frame.page.locator('.details').isHidden(), true)
  })
})
