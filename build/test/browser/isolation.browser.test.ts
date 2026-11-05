// A model is untrusted input: whatever URIs it names, the viewer must not reach the network or the
// file system, and must never write to the document it shows.
import assert from 'node:assert/strict'
import { after, afterEach, beforeEach, describe, it } from 'node:test'
import { embeddedGltfText, glb, TRIANGLE_BIN, triangleGltf } from '../fixtures/models.ts'
import { assertContained } from './frame-assertions.ts'
import { closeBrowser, type Frame, openFrame } from './harness.ts'

// Every way a URI could point off the plugin's own in-memory data.
const HOSTILE_URIS = [
  'https://attacker.test/beacon.png',
  'http://127.0.0.1:8080/probe.png',
  'http://[::1]/probe.png',
  'http://169.254.169.254/latest/meta-data/',
  'https://user:secret@attacker.test/creds.png',
  '//attacker.test/protocol-relative.png',
  'file:///etc/passwd',
  'file:///C:/Windows/win.ini',
  '\\\\attacker.test\\share\\unc.png',
  'C:\\Users\\victim\\secret.png',
  '/etc/hosts',
  '../../../../secrets/id_rsa',
  'texture.png',
  'orca-plugin-frame://another-plugin/editor/index.html',
  'javascript:alert(document.domain)',
  'ws://attacker.test/socket',
  'ftp://attacker.test/a.png',
  ' https://attacker.test/leading-space.png',
  'HTTPS://ATTACKER.TEST/UPPER.PNG',
  'blob:https://attacker.test/00000000-0000-0000-0000-000000000000'
]

let frame: Frame
beforeEach(async () => {
  frame = await openFrame()
})
afterEach(() => frame.close())
after(closeBrowser)

describe('network isolation', () => {
  it('never requests an external texture, whatever its URI', async () => {
    for (const uri of HOSTILE_URIS) {
      const state = await frame.open({ bytes: glb(triangleGltf({ imageUris: [uri] })) })
      assert.equal(state.kind, 'model', uri)
      assert.match(state.kind === 'model' ? (state.notice ?? '') : '', /are not shown/, uri)
    }
    assertContained(await frame.report())
  })

  it('names a few of the textures it left off and counts the rest', async () => {
    const state = await frame.open({ bytes: glb(triangleGltf({ imageUris: HOSTILE_URIS })) })
    const notice = state.kind === 'model' ? (state.notice ?? '') : ''
    assert.ok(notice.includes(`“${HOSTILE_URIS[0]}”`), notice)
    assert.match(notice, new RegExp(`and ${HOSTILE_URIS.length - 3} more`))
    assertContained(await frame.report())
  })

  it('refuses external geometry before requesting anything', async () => {
    for (const bufferUri of HOSTILE_URIS) {
      const state = await frame.open({ text: JSON.stringify(triangleGltf({ bufferUri })) })
      assert.equal(state.kind, 'error', `${bufferUri} was not refused`)
    }
    assertContained(await frame.report())
  })

  it('treats an external URI in a GLB the same way as in a .gltf', async () => {
    const json = triangleGltf()
    json.buffers = [{ byteLength: TRIANGLE_BIN.byteLength }, { byteLength: 4, uri: 'https://attacker.test/extra.bin' }]
    const state = await frame.open({ bytes: glb(json) })
    assert.equal(state.kind, 'error')
    assertContained(await frame.report())
  })

  it('loads nothing but its own files', async () => {
    await frame.open({ text: embeddedGltfText({ imageUris: HOSTILE_URIS }) })
    const report = await frame.report()
    for (const file of report.served) {
      assert.match(file, /^editor\/(index\.html|assets\/[\w-]+\.js|draco\/draco_(wasm_wrapper\.js|decoder\.wasm))$/)
    }
    assertContained(report)
  })
})

describe('read-only', () => {
  it('never edits, saves or calls Orca, across every kind of document', async () => {
    await frame.open({ bytes: glb(triangleGltf({ animationNames: ['Walk'] })) })
    await frame.page.locator('button[aria-label="Wireframe"]').click()
    await frame.page.locator('button[aria-label="Pause animation"]').click()
    await frame.page.keyboard.press('Control+s')
    await frame.open({ text: embeddedGltfText() })
    await frame.open({ bytes: new Uint8Array([1, 2, 3]) })
    assertContained(await frame.report(), { allowParseFailure: true })
  })
})
