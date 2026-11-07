// What the Details panel shows, for someone filing an issue: the viewer and browser, the last few
// loads with their timings and outcomes, and the errors the viewer met. It holds no model data: no
// names from the file, no geometry, no paths. Error messages may quote a little of the file, so they
// are cleaned and cut short like any other text from it.
import { cleanText } from './display-format.ts'

// Set by build.mjs from orca-plugin.json.
declare const VIEWER_VERSION: string

const MAX_LOADS = 5
const MAX_ERRORS = 10
const MAX_MESSAGE_CHARS = 300
const STACK_LINES = 4

export type LoadRecord = {
  version: number
  format: string
  bytes: number
  steps: string[]
  outcome: string
  /** What the viewer told the person, in their language. */
  message: string | null
  started: number
  stepStarted: number
}

const loads: LoadRecord[] = []
const errors: string[] = []

const clean = (text: string): string => cleanText(text, MAX_MESSAGE_CHARS)

export function beginLoad(version: number, format: string, bytes: number): LoadRecord {
  const now = performance.now()
  const record: LoadRecord = { version, format, bytes, steps: [], outcome: 'loading', message: null, started: now, stepStarted: now }
  loads.push(record)
  if (loads.length > MAX_LOADS) loads.shift()
  return record
}

/** Notes how long `name`, the step that just ended, took. */
export function endStep(record: LoadRecord, name: string): void {
  const now = performance.now()
  record.steps.push(`${name} ${Math.round(now - record.stepStarted)} ms`)
  record.stepStarted = now
}

export function finishLoad(record: LoadRecord, outcome: string): void {
  if (record.outcome === 'loading') record.outcome = clean(outcome)
}

export function noteMessage(record: LoadRecord, message: string): void {
  record.message = clean(message)
}

export function noteError(where: string, error: unknown): void {
  const text =
    error instanceof Error
      ? [`${error.name}: ${clean(error.message)}`, ...(error.stack ?? '').split('\n').slice(1, 1 + STACK_LINES).map((line) => `    ${line.trim()}`)]
      : [clean(String(error))]
  errors.push(`${where}: ${text.join('\n')}`)
  if (errors.length > MAX_ERRORS) errors.shift()
}

export type Environment = { locale: string; graphics: string | null; maxTextureSize: number | null }

function formatBytes(bytes: number): string {
  return bytes < 1024 * 1024 ? `${(bytes / 1024).toFixed(1)} KiB` : `${(bytes / 1024 / 1024).toFixed(1)} MiB`
}

export function diagnosticsReport({ locale, graphics, maxTextureSize }: Environment): string {
  const lines = [
    `3D Viewer ${VIEWER_VERSION}`,
    `Locale: ${locale}`,
    `Browser: ${navigator.userAgent}`,
    `Graphics: ${graphics ?? 'not started'}${maxTextureSize ? `, max texture ${maxTextureSize}` : ''}`,
    '',
    'Loads (latest last):',
    ...(loads.length === 0
      ? ['- none']
      : loads.map(
          (load) =>
            `- #${load.version} ${load.format.toUpperCase()} ${formatBytes(load.bytes)}: ${[...load.steps, load.outcome].join(', ')}` +
            (load.message ? `\n    message: ${load.message}` : '')
        )),
    '',
    'Errors:',
    ...(errors.length === 0 ? ['- none'] : errors.map((error) => `- ${error}`))
  ]
  return lines.join('\n')
}
