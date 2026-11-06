import { displayName, formatBytes, formatCount, nameList } from './display-format.ts'
import { type BudgetExcess, DECODE_ALLOWANCE_BYTES } from './gltf-budget.ts'
import { decodedBytes, resetDecodeAllowance } from './decode-allowance.ts'
import { type GltfModelData, gltfExternalResources } from './gltf-document-inspection.ts'
import { ParseAbortedError, ParseTimeoutError, parseGltfModel, stopDecoders } from './gltf-model-parse.ts'
import { loadedModelExcess } from './loaded-model-limits.ts'
import { checkModelOffThread } from './model-check.ts'
import { disposeObjectTree } from './model-disposal.ts'
import type { Refusal } from './model-refusal.ts'
import { resolveLocale } from './locale.ts'
import { createTranslate } from './messages.ts'
import { createModelStage, type ModelStage, type ModelSummary } from './model-scene.ts'
import { editorFrame, type OrcaDocument } from './orca-editor-host.ts'
import { createViewerUi } from './viewer-ui.ts'

// Console prefixes the tests tell apart: a file the viewer refused, and a failure of the viewer itself.
export const PARSE_FAILURE_LOG = 'glTF Viewer: could not parse the model'
export const RENDER_FAILURE_LOG = 'glTF Viewer: could not display the model'

const frame = editorFrame()
const locale = resolveLocale(frame?.locale, navigator.language)
document.documentElement.lang = locale
const t = createTranslate(locale)
const root = document.getElementById('app')
if (!root) {
  throw new Error('index.html has no #app element')
}
const ui = createViewerUi(root, t, locale)

let stage: ModelStage | null = null
let shownVersion: number | null = null
let lastShown: { summary: ModelSummary; notices: string[] } | null = null
// The notices on screen now, which a later failed save adds to; a driver reset brings them back as they were.
let shownNotices: string[] = []

function showModel(summary: ModelSummary, target: ModelStage, notices: string[], keepToggles: boolean): void {
  shownNotices = notices
  ui.showModel(summary, target, notices, keepToggles)
}

function modelData(content: OrcaDocument['content']): GltfModelData {
  return content.kind === 'bytes' ? content.bytes : content.text
}

const count = (value: number): string => formatCount(value, locale)

function budgetMessage(excess: BudgetExcess): string {
  switch (excess.kind) {
    case 'geometryBytes':
      return t('tooLargeGeometry', { value: formatBytes(excess.value, locale), limit: formatBytes(excess.limit, locale) })
    case 'gpuBytes':
      return t('tooLargeGpu', { value: formatBytes(excess.value, locale), limit: formatBytes(excess.limit, locale) })
    case 'nodes':
      return t('tooManyNodes', { value: count(excess.value), limit: count(excess.limit) })
    case 'drawCalls':
      return t('tooManyDrawCalls', { value: count(excess.value), limit: count(excess.limit) })
    case 'images':
      return t('tooManyImages', { value: count(excess.value), limit: count(excess.limit) })
    case 'drawnVertices':
      return t('tooManyDrawnVertices', { value: count(excess.value), limit: count(excess.limit) })
    case 'materials':
      return t('tooManyMaterials', { value: count(excess.value), limit: count(excess.limit) })
    case 'animationChannels':
      return t('tooManyChannels', { value: count(excess.value), limit: count(excess.limit) })
    case 'tooComplex':
      return t('tooComplex')
    case 'animationTracks':
      return t('tooManyTracks', { value: count(excess.value), limit: count(excess.limit) })
    case 'totalBytes':
      return t('tooLargeTotal', { value: formatBytes(excess.value, locale), limit: formatBytes(excess.limit, locale) })
    case 'textures':
      return t('tooManyTextures', { value: count(excess.value), limit: count(excess.limit) })
    case 'skinJoints':
      return t('tooManyJoints', { value: count(excess.value), limit: count(excess.limit) })
    case 'imageSide':
      return t('imageTooLarge', { width: count(excess.width), height: count(excess.height), limit: count(excess.limit) })
    case 'unreadableImage':
      return t('unreadableImage', { index: excess.index })
    case 'unreadableDraco':
      return t('unreadableDraco', { index: excess.mesh })
  }
}

const more = (list: string, rest: number): string => t('moreFiles', { list, count: count(rest) }, rest)

function refusalMessage(refusal: Refusal): string {
  switch (refusal.kind) {
    case 'truncated':
      return t('truncated', { actual: count(refusal.actualBytes), declared: count(refusal.declaredBytes) })
    case 'corrupt':
      // Why cleaned: the path holds keys from the file, which may be long or carry control characters.
      return t('corrupt', { path: displayName(refusal.path), reason: refusal.reason })
    case 'parseFailed':
      return t('parseFailed')
    case 'unsupportedExtensions':
      return t('unsupportedExtensions', { extensions: nameList(refusal.extensions, more) })
    case 'externalBuffers':
      return t('externalBuffers', { files: nameList(refusal.files, more) })
    case 'budget':
      return budgetMessage(refusal.excess)
  }
}

function stageFor(): ModelStage {
  stage ??= createModelStage(ui.viewport, {
    onContextLost: () => ui.showError(t('contextLost')),
    onContextRestored: () => {
      if (stage && lastShown) showModel(lastShown.summary, stage, shownNotices, true)
    }
  })
  return stage
}

/** Shows why `version` failed: over the last good model when there is one, else in its place. */
function fail(message: string, log: string | null, error: unknown): void {
  if (log) console.error(log, error)
  if (stage && lastShown) {
    showModel(lastShown.summary, stage, [t('laterSaveFailed', { reason: message }), ...lastShown.notices], true)
    return
  }
  stage?.clear()
  ui.showError(message)
}

async function load(orcaDocument: OrcaDocument): Promise<void> {
  const replacing = lastShown !== null
  // Why keep the old model up while the new one loads: an agent re-exporting a file should not flash it.
  if (replacing) ui.setPending(t('loadingNewer'))
  else ui.showLoading()

  const data = modelData(orcaDocument.content)
  abortLoad = new AbortController()
  let checked: Awaited<ReturnType<typeof checkModelOffThread>>
  try {
    checked = await checkModelOffThread(data, { signal: abortLoad.signal })
  } catch (error) {
    if (error instanceof ParseAbortedError) return
    fail(t(error instanceof ParseTimeoutError ? 'parseTimeout' : 'parseFailed'), PARSE_FAILURE_LOG, error)
    return
  }
  const gltf = checked.document
  if (!gltf) {
    fail(refusalMessage(checked.refusal), null, null)
    return
  }

  let target: ModelStage
  try {
    target = stageFor()
  } catch (error) {
    fail(t('webglUnavailable'), RENDER_FAILURE_LOG, error)
    return
  }

  let model: Awaited<ReturnType<typeof parseGltfModel>>
  try {
    resetDecodeAllowance(DECODE_ALLOWANCE_BYTES)
    model = await parseGltfModel(data, gltf, { renderer: target.renderer, signal: abortLoad.signal })
  } catch (error) {
    // Why silent: a newer document is already waiting to load.
    if (error instanceof ParseAbortedError) return
    fail(t(error instanceof ParseTimeoutError ? 'parseTimeout' : 'parseFailed'), PARSE_FAILURE_LOG, error)
    return
  } finally {
    abortLoad = null
    // Why: decoder workers keep the largest heap they grew to; after a big decode, start fresh ones next time.
    if (decodedBytes() > LARGE_DECODE_BYTES) stopDecoders()
  }

  const excess = loadedModelExcess(model.scene, model.animations)
  if (excess) {
    disposeObjectTree(model.scene)
    fail(t('tooLargeLoaded', { what: `${excess.what} ${count(excess.value)} > ${count(excess.limit)}` }), null, null)
    return
  }

  try {
    const summary = await target.show(model, replacing)
    const images = gltfExternalResources(gltf).images
    const notices = [
      ...(images.length > 0 ? [t('externalImages', { files: nameList(images, more) })] : []),
      ...(summary.otherSceneCount > 0
        ? [t('otherScenes', { count: count(summary.otherSceneCount) }, summary.otherSceneCount)]
        : [])
    ]
    showModel(summary, target, notices, replacing)
    // Why autoplay: a still frame cannot show whether the clips were exported at all.
    target.playAnimation(0)
    lastShown = { summary, notices }
  } catch (error) {
    fail(t('renderFailed'), RENDER_FAILURE_LOG, error)
  }
}

// One load at a time: a save that arrives meanwhile aborts the check or parse in progress and runs next.
let loading = false
let pending: OrcaDocument | null = null
let abortLoad: AbortController | null = null
// Decoding more than this in one parse restarts the decoder workers afterwards, to give the memory back.
const LARGE_DECODE_BYTES = 64 * 1024 * 1024

async function drain(): Promise<void> {
  loading = true
  try {
    while (pending) {
      const next = pending
      pending = null
      // Why: Orca may resend the version on screen; reloading it would only flash and reset the view.
      if (next.version === shownVersion && lastShown) continue
      try {
        await load(next)
      } catch (error) {
        fail(t('renderFailed'), RENDER_FAILURE_LOG, error)
      }
      shownVersion = next.version
      // Why: the old model stays up while a new one loads, so "settled" needs its own signal for tests and tools.
      document.documentElement.dataset.shownVersion = String(next.version)
    }
  } finally {
    loading = false
  }
}

if (frame?.document) {
  // Called with the current document right away, then again whenever the file changes on disk.
  frame.document.onDidChange((orcaDocument) => {
    pending = orcaDocument
    abortLoad?.abort()
    if (!loading) void drain()
  })
} else {
  ui.showError(t('parseFailed'))
}
