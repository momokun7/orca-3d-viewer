// Runs editor/ in headless Chromium the way Orca's isolated plugin frame does: the same
// Content-Security-Policy header, no network beyond the plugin's own files, and a stand-in
// `window.orca` that records every call the viewer makes.
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { type Browser, type BrowserContext, chromium, type Page } from 'playwright-core'
import { decodePng, pixelAt } from '../fixtures/png-decode.ts'

const EDITOR = path.resolve(import.meta.dirname, '..', '..', '..', 'editor')
export const ORIGIN = 'https://orca-plugin-frame.test'
const ENTRY = `${ORIGIN}/editor/index.html`

// Copied verbatim from Orca's docs/reference/plugin-isolated-frames.md ("CSP").
export const ORCA_FRAME_CSP =
  "default-src 'self'; script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval'; style-src 'self' 'unsafe-inline'; " +
  "img-src 'self' data: blob:; font-src 'self' data:; media-src 'self' data: blob:; connect-src 'self' data: blob:; " +
  "worker-src 'self' blob:; frame-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'"

const CONTENT_TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.wasm': 'application/wasm'
}

// The viewer's own console lines (src/main.ts): a file it refused, and a failure of its own.
export const PARSE_FAILURE_LOG = '3D Viewer: could not parse the model'
export const RENDER_FAILURE_LOG = '3D Viewer: could not display the model'

export type ConsoleLine = { type: string; text: string }

export type FrameReport = {
  /** Requests for the plugin's own files. */
  served: string[]
  /** Every other request the page made: each is network egress Orca would have blocked. */
  egress: string[]
  pageErrors: string[]
  /** Console errors and warnings. */
  console: ConsoleLine[]
  cspViolations: string[]
  /** Calls to `window.orca` beyond reading the document: a read-only viewer makes none. */
  hostCalls: string[]
}

export type ViewerState =
  | { kind: 'model'; figures: string[]; notice: string | null; animations: string[] }
  | { kind: 'error'; message: string }

declare global {
  interface Window {
    __orcaTest: {
      send: (document: unknown) => void
      hostCalls: string[]
      cspViolations: string[]
    }
  }
}

type StandInOptions = { locale: string; webgl: boolean }

/** Installed before the page's own scripts, as Orca's frame shell is. */
function installOrcaStandIn({ locale, webgl }: StandInOptions): void {
  const hostCalls: string[] = []
  const cspViolations: string[] = []
  let listener: ((document: unknown) => void) | null = null
  const record = (name: string) => (...args: unknown[]) => {
    hostCalls.push(`${name}(${JSON.stringify(args).slice(0, 200)})`)
    return Promise.reject(Object.assign(new Error('not_permitted'), { code: 'not_permitted' }))
  }
  if (!webgl) {
    // Stands in for a blocklisted GPU or graphics acceleration turned off.
    const getContext = HTMLCanvasElement.prototype.getContext
    HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, kind: string, ...rest: unknown[]) {
      return kind.startsWith('webgl') ? null : getContext.call(this, kind as '2d', ...(rest as []))
    } as typeof getContext
  }
  document.addEventListener('securitypolicyviolation', (event) => {
    cspViolations.push(`${event.violatedDirective} ${event.blockedURI}`)
  })
  Object.defineProperty(window, 'orca', {
    value: Object.freeze({
      api: { major: 1, minor: 2 },
      locale,
      host: { call: record('host.call'), has: () => false },
      on: (event: string) => {
        hostCalls.push(`on(${event})`)
        return { dispose() {} }
      },
      shell: { openExternal: record('shell.openExternal') },
      files: { saveAs: record('files.saveAs') },
      document: Object.freeze({
        get: record('document.get'),
        applyEdit: record('document.applyEdit'),
        session: record('document.session'),
        onDidChange: (next: (document: unknown) => void) => {
          listener = next
          return { dispose() {} }
        }
      })
    })
  })
  window.__orcaTest = {
    hostCalls,
    cspViolations,
    send: (document) => {
      if (!listener) throw new Error('the viewer has not subscribed to document changes')
      listener(document)
    }
  }
}

let browser: Browser | null = null

export async function launchBrowser(): Promise<Browser> {
  // Why SwiftShader by default: CI runners have no GPU, and WebGL must still work the same everywhere.
  // ORCA_TEST_ANGLE=native keeps the platform's own backend (D3D11 on Windows, Metal on macOS).
  const native = process.env.ORCA_TEST_ANGLE === 'native'
  browser ??= await chromium.launch({
    args: [
      ...(native ? [] : ['--use-angle=swiftshader', '--enable-unsafe-swiftshader']),
      '--ignore-gpu-blocklist',
      // Why: the leak test collects garbage before it measures the heap.
      '--js-flags=--expose-gc'
    ]
  })
  return browser
}

export async function closeBrowser(): Promise<void> {
  await browser?.close()
  browser = null
}

export type Content = { bytes: Uint8Array } | { text: string }

export type Frame = {
  page: Page
  context: BrowserContext
  report: () => Promise<FrameReport>
  /** Sends a document the way Orca does when the file opens or changes on disk, and waits until it settles. */
  open: (content: Content, options?: { version?: number }) => Promise<ViewerState>
  /** Sends a document without waiting, as a burst of saves does. */
  send: (content: Content, version: number) => Promise<void>
  /** Waits until the document with `version` has settled on a model or an error. */
  settled: (version: number) => Promise<ViewerState>
  state: () => Promise<ViewerState | null>
  /** The RGB(A) of the composited page at a point in the viewport, in CSS pixels. */
  pixel: (x: number, y: number) => Promise<number[]>
  close: () => Promise<void>
}

export async function openFrame({ locale = 'en-US', webgl = true } = {}): Promise<Frame> {
  const context = await (await launchBrowser()).newContext({ viewport: { width: 800, height: 600 } })
  const served: string[] = []
  const egress: string[] = []
  const pageErrors: string[] = []
  const consoleLines: ConsoleLine[] = []

  await context.route('**/*', async (route) => {
    const url = route.request().url()
    const relative = url.startsWith(`${ORIGIN}/editor/`) ? url.slice(`${ORIGIN}/`.length).split(/[?#]/)[0] : null
    const file = relative ? path.resolve(EDITOR, '..', relative) : null
    if (!file || !file.startsWith(EDITOR + path.sep)) {
      egress.push(url)
      await route.abort('blockedbyclient')
      return
    }
    served.push(relative!)
    const body = await readFile(file).catch(() => null)
    if (!body) {
      await route.fulfill({ status: 404, body: 'not found' })
      return
    }
    const type = CONTENT_TYPES[path.extname(file)] ?? 'application/octet-stream'
    await route.fulfill({
      status: 200,
      body,
      headers: {
        'content-type': type,
        ...(type.startsWith('text/html') ? { 'content-security-policy': ORCA_FRAME_CSP } : {})
      }
    })
  })
  // Requests the route never sees (other schemes) still count as egress.
  context.on('request', (request) => {
    const url = request.url()
    if (!/^(https?:|data:|blob:)/.test(url)) egress.push(url)
  })

  const page = await context.newPage()
  page.on('pageerror', (error) => pageErrors.push(String(error)))
  page.on('console', (message) => {
    if (message.type() === 'error' || message.type() === 'warning') {
      consoleLines.push({ type: message.type(), text: message.text() })
    }
  })
  await page.addInitScript(installOrcaStandIn, { locale, webgl })
  await page.goto(ENTRY)
  await page.waitForFunction(() => document.querySelector('.toolbar') !== null)

  const state = (): Promise<ViewerState | null> =>
    page.evaluate((): ViewerState | null => {
      const overlay = document.querySelector<HTMLElement>('.overlay')
      const toolbar = document.querySelector<HTMLElement>('.toolbar')
      if (overlay && !overlay.hidden && toolbar?.hidden) {
        return { kind: 'error', message: overlay.innerText.trim() }
      }
      if (overlay?.hidden && document.querySelector('.viewport canvas')) {
        const notice = document.querySelector<HTMLElement>('.notice')
        return {
          kind: 'model',
          figures: [...document.querySelectorAll<HTMLElement>('.figure')]
            .filter((figure) => !figure.hidden)
            .map((figure) => figure.innerText),
          notice: notice && !notice.hidden ? notice.innerText : null,
          animations: [...document.querySelectorAll('option')].map((option) => option.textContent ?? '')
        }
      }
      return null
    })

  let nextVersion = 1
  const send = async (content: Content, version: number): Promise<void> => {
    await page.evaluate(
      ({ base64, text, version }) => {
        const document =
          base64 === null
            ? { version, readOnly: false, content: { kind: 'text', text }, fileType: '.gltf' }
            : {
                version,
                readOnly: false,
                content: { kind: 'bytes', bytes: Uint8Array.from(atob(base64), (c) => c.charCodeAt(0)).buffer },
                fileType: '.glb'
              }
        window.__orcaTest.send(document)
      },
      'bytes' in content
        ? { base64: Buffer.from(content.bytes).toString('base64'), text: null, version }
        : { base64: null, text: content.text, version }
    )
  }
  const settled = async (version: number): Promise<ViewerState> => {
    const handle = await page.waitForFunction(
      (expected) => document.documentElement.dataset.shownVersion === String(expected),
      version,
      { timeout: 30_000 }
    )
    await handle.dispose()
    const result = await state()
    if (!result) throw new Error('the viewer settled on neither a model nor an error')
    return result
  }

  return {
    page,
    context,
    state,
    send,
    settled,
    report: async () => ({
      served,
      egress,
      pageErrors,
      console: consoleLines,
      ...(await page.evaluate(() => ({
        cspViolations: [...window.__orcaTest.cspViolations],
        hostCalls: [...window.__orcaTest.hostCalls]
      })))
    }),
    open: async (content, { version } = {}) => {
      const sent = version ?? nextVersion++
      await send(content, sent)
      return settled(sent)
    },
    pixel: async (x, y) => {
      const shot = await page.screenshot({ clip: { x, y, width: 1, height: 1 }, animations: 'disabled' })
      return pixelAt(decodePng(shot), 0, 0)
    },
    close: () => context.close()
  }
}
