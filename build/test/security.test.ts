// Security invariants that hold without a browser: what URLs reach the loader, what a hostile file
// can make the parsers do, what the source may call, and what the manifest may ask Orca for.
import assert from 'node:assert/strict'
import { readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, it } from 'node:test'
import fc from 'fast-check'
import { gltfExternalResources, readGltfDocument } from '../src/gltf-document-inspection.ts'
import { BLOCKED_RESOURCE_URL, resolveResourceUrl } from '../src/gltf-model-parse.ts'
import { createTranslate } from '../src/messages.ts'
import { glb, triangleGltf } from './fixtures/models.ts'

const FUZZ_RUNS = Number(process.env.FUZZ_RUNS ?? 2000)
const FUZZ_SEED = process.env.FUZZ_SEED ? Number(process.env.FUZZ_SEED) : undefined
const ROOT = path.resolve(import.meta.dirname, '..', '..')
const SRC = path.join(ROOT, 'build', 'src')
const ORIGIN = 'orca-plugin-frame://0123456789abcdef'
const OWN_BLOB = `blob:${ORIGIN}/6f1c0c7e-0000-4000-8000-000000000000`

describe('resolveResourceUrl', () => {
  it('passes data: URIs, whatever the scheme’s case, and the blob: URLs this viewer created', () => {
    assert.equal(resolveResourceUrl('data:image/png;base64,AAAA'), 'data:image/png;base64,AAAA')
    assert.equal(resolveResourceUrl('DATA:image/png;base64,AAAA'), 'DATA:image/png;base64,AAAA')
    assert.equal(resolveResourceUrl(OWN_BLOB, new Set([OWN_BLOB])), OWN_BLOB)
  })

  it('blocks every other URL a model can name, including same-origin blob: URLs it did not create', () => {
    for (const url of [
      'https://attacker.test/a.png',
      '//attacker.test/a.png',
      'file:///etc/passwd',
      '\\\\host\\share\\a.png',
      'texture.png',
      '../secret.png',
      ' data:image/png;base64,AAAA',
      'blob:https://attacker.test/6f1c0c7e',
      OWN_BLOB,
      `${OWN_BLOB}#fragment`,
      'javascript:alert(1)'
    ]) {
      assert.equal(resolveResourceUrl(url), BLOCKED_RESOURCE_URL, url)
    }
  })

  it('never lets through anything but data: URIs or the blob: URLs it was given, for arbitrary input', () => {
    fc.assert(
      fc.property(fc.oneof(fc.string(), fc.webUrl(), fc.string({ unit: 'binary' })), (url) => {
        const resolved = resolveResourceUrl(url, new Set([OWN_BLOB]))
        assert.ok(resolved === BLOCKED_RESOURCE_URL || (resolved === url && (/^data:/i.test(url) || url === OWN_BLOB)))
      }),
      { numRuns: FUZZ_RUNS, seed: FUZZ_SEED }
    )
  })

  it('stands in for a blocked image with a data: URI, so blocking itself makes no request', () => {
    assert.match(BLOCKED_RESOURCE_URL, /^data:image\/png;base64,/)
  })
})

describe('readGltfDocument on hostile bytes', () => {
  const seed = glb(triangleGltf({ animationNames: ['Walk'] }))

  it('returns a document or null for arbitrary bytes, never throwing', () => {
    fc.assert(
      fc.property(fc.uint8Array({ maxLength: 4096 }), (bytes) => {
        const document = readGltfDocument(bytes.slice().buffer)
        assert.ok(document === null || (typeof document === 'object' && !Array.isArray(document)))
      }),
      { numRuns: FUZZ_RUNS, seed: FUZZ_SEED }
    )
  })

  it('returns a document or null for corrupted GLB headers and chunks', () => {
    fc.assert(
      fc.property(
        fc.array(fc.tuple(fc.nat(39), fc.integer({ min: 0, max: 255 })), { minLength: 1, maxLength: 8 }),
        fc.nat(seed.length),
        (flips, cut) => {
          const bytes = seed.slice(0, cut)
          for (const [at, value] of flips) if (at < bytes.length) bytes[at] = value
          readGltfDocument(bytes.buffer)
        }
      ),
      { numRuns: FUZZ_RUNS, seed: FUZZ_SEED }
    )
  })

  it('returns a document or null for arbitrary text', () => {
    fc.assert(
      fc.property(fc.oneof(fc.string(), fc.json()), (text) => {
        const document = readGltfDocument(text)
        assert.ok(document === null || typeof document === 'object')
      }),
      { numRuns: FUZZ_RUNS, seed: FUZZ_SEED }
    )
  })
})

describe('gltfExternalResources on hostile documents', () => {
  it('returns only strings found in the document, never data: URIs, and never throws', () => {
    fc.assert(
      fc.property(
        fc.dictionary(fc.constantFrom('buffers', 'images', 'asset', '__proto__', 'constructor'), fc.jsonValue()),
        (document) => {
          const { buffers, images } = gltfExternalResources(document)
          const text = JSON.stringify(document)
          for (const uri of [...buffers, ...images]) {
            assert.equal(typeof uri, 'string')
            assert.ok(!uri.startsWith('data:'))
            assert.ok(text.includes(JSON.stringify(uri).slice(1, -1)))
          }
        }
      ),
      { numRuns: FUZZ_RUNS, seed: FUZZ_SEED }
    )
  })
})

describe('message formatting', () => {
  it('inserts untrusted values once, without expanding placeholders inside them', () => {
    const t = createTranslate('en')
    assert.equal(
      t('externalImages', { files: '{{files}} {{__proto__}} <b>x</b>' }),
      'Textures in separate files ({{files}} {{__proto__}} <b>x</b>) are not shown: Orca plugins cannot read files beside the model. Use a .glb to see them.'
    )
  })

  it('fills a placeholder only from the values’ own fields, never inherited ones', () => {
    assert.equal(createTranslate('en')('animationFallback', {}), 'Animation {{index}}')
    assert.equal(createTranslate('en')('animationFallback', Object.create({ index: 9 })), 'Animation {{index}}')
  })
})

describe('source', () => {
  // Each of these either parses markup, evaluates strings as code, or opens a channel off the frame.
  const FORBIDDEN: [RegExp, string][] = [
    [/\.innerHTML\b|\.outerHTML\b|insertAdjacentHTML|document\.write|DOMParser|createContextualFragment/, 'parses markup'],
    [/\beval\s*\(|new\s+Function\b|set(Timeout|Interval)\s*\(\s*['"`]/, 'evaluates strings as code'],
    [/\bfetch\s*\(|XMLHttpRequest|WebSocket|EventSource|sendBeacon|RTCPeerConnection|importScripts/, 'opens a network channel'],
    [/window\.open\s*\(|location\s*\.\s*(href|assign|replace)|postMessage\s*\(/, 'navigates or messages another window'],
    [/localStorage|sessionStorage|indexedDB|document\.cookie/, 'keeps data beyond the open document'],
    [/orca\??\.(host|shell|files)\b|applyEdit|\.session\s*\(/, 'calls Orca beyond reading the document'],
    [/new\s+(Shared)?Worker\b|serviceWorker/, 'starts code beside the page']
  ]
  // The one worker the viewer starts itself, and the only messages it passes: the model in, the verdict out.
  const ALLOWED: Record<string, RegExp> = {
    'model-check.ts': /\bnew Worker\(workerUrl\)|\bworker\.postMessage\(data\)/g,
    'model-check-worker.ts': /\bself\.postMessage\(/g
  }

  // Why strip comments: they may name these APIs while explaining what the code does instead.
  const code = (file: string): string =>
    readFileSync(path.join(SRC, file), 'utf8')
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/(^|[^:'"`\\])\/\/.*$/gm, '$1')

  for (const file of readdirSync(SRC).filter((name) => /\.(ts|css)$/.test(name))) {
    it(`${file} uses no API outside the viewer’s sandbox`, () => {
      const text = code(file).replace(ALLOWED[file] ?? /$^/g, '')
      for (const [pattern, reason] of FORBIDDEN) {
        assert.doesNotMatch(text, pattern, `${file} ${reason}`)
      }
    })
  }

  it('loads only modules from the bundle, never by URL', () => {
    for (const file of readdirSync(SRC).filter((name) => name.endsWith('.ts'))) {
      for (const [, specifier] of readFileSync(path.join(SRC, file), 'utf8').matchAll(/import\s*\(\s*['"]([^'"]+)['"]/g)) {
        assert.doesNotMatch(specifier, /^[a-z][\w+.-]*:|^\/\//i, `${file} imports ${specifier}`)
      }
    }
  })
})

describe('manifest', () => {
  const manifest = JSON.parse(readFileSync(path.join(ROOT, 'orca-plugin.json'), 'utf8'))

  it('asks Orca for no capability, worker or command, only sandboxed editors', () => {
    assert.equal(manifest.execution, 'sandboxed-ui')
    assert.deepEqual(manifest.capabilities, [])
    assert.equal(manifest.main, undefined)
    assert.deepEqual(Object.keys(manifest.contributes), ['customEditors'])
  })

  it('opens only .glb and .gltf, in the isolated frame', () => {
    assert.deepEqual(
      manifest.contributes.customEditors.map((editor: Record<string, unknown>) => ({
        extensions: editor.extensions,
        frame: editor.frame,
        entry: editor.entry
      })),
      [
        { extensions: ['.glb'], frame: 'isolated', entry: 'editor/index.html' },
        { extensions: ['.gltf'], frame: 'isolated', entry: 'editor/index.html' }
      ]
    )
  })
})
