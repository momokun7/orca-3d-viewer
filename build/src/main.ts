import { formatBytes, formatCount, nameList } from './display-format.ts'
import { type BudgetExcess, gltfBudgetExcess } from './gltf-budget.ts'
import {
  type GltfDocument,
  type GltfModelData,
  glbTruncation,
  gltfBuffersFitContainer,
  gltfExternalResources,
  gltfUnsupportedRequiredExtensions,
  readGlbBinChunk,
  readGltfDocument
} from './gltf-document-inspection.ts'
import { ParseTimeoutError, parseGltfModel } from './gltf-model-parse.ts'
import { validateGltfStructure } from './gltf-validation.ts'
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

/** Why the document cannot be shown, found from its bytes and JSON alone; null when it may load. */
function refusal(data: GltfModelData, gltf: GltfDocument | null): string | null {
  const truncation = glbTruncation(data)
  if (truncation) {
    return t('truncated', { actual: count(truncation.actualBytes), declared: count(truncation.declaredBytes) })
  }
  if (!gltf) return t('parseFailed')
  const bin = readGlbBinChunk(data)
  const structure = validateGltfStructure(gltf, bin?.byteLength ?? null)
  if (structure) return t('corrupt', { path: structure.path, reason: structure.reason })
  if (!gltfBuffersFitContainer(gltf, typeof data !== 'string')) return t('parseFailed')
  const unsupported = gltfUnsupportedRequiredExtensions(gltf)
  if (unsupported.length > 0) return t('unsupportedExtensions', { extensions: nameList(unsupported, more) })
  const { buffers } = gltfExternalResources(gltf)
  if (buffers.length > 0) return t('externalBuffers', { files: nameList(buffers, more) })
  const excess = gltfBudgetExcess(gltf, bin)
  return excess ? budgetMessage(excess) : null
}

function stageFor(): ModelStage {
  stage ??= createModelStage(ui.viewport, {
    onContextLost: () => ui.showError(t('contextLost')),
    onContextRestored: () => {
      if (stage && lastShown) ui.showModel(lastShown.summary, stage, lastShown.notices, true)
    }
  })
  return stage
}

/** Shows why `version` failed: over the last good model when there is one, else in its place. */
function fail(message: string, log: string | null, error: unknown): void {
  if (log) console.error(log, error)
  if (stage && lastShown) {
    ui.showModel(lastShown.summary, stage, [t('laterSaveFailed', { reason: message }), ...lastShown.notices], true)
    return
  }
  stage?.clear()
  ui.showError(message)
}

async function load(orcaDocument: OrcaDocument): Promise<void> {
  const replacing = lastShown !== null
  // Why keep the old model up while the new one loads: an agent re-exporting a file should not flash it.
  if (!replacing) ui.showLoading()

  const data = modelData(orcaDocument.content)
  const gltf = readGltfDocument(data)
  const refused = refusal(data, gltf)
  if (refused || !gltf) {
    fail(refused ?? t('parseFailed'), null, null)
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
    model = await parseGltfModel(data, gltf, { renderer: target.renderer })
  } catch (error) {
    fail(t(error instanceof ParseTimeoutError ? 'parseTimeout' : 'parseFailed'), PARSE_FAILURE_LOG, error)
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
    ui.showModel(summary, target, notices, replacing)
    // Why autoplay: a still frame cannot show whether the clips were exported at all.
    target.playAnimation(0)
    lastShown = { summary, notices }
  } catch (error) {
    fail(t('renderFailed'), RENDER_FAILURE_LOG, error)
  }
}

// One load at a time: a save that arrives meanwhile waits, and only the newest waiting one runs.
let loading = false
let pending: OrcaDocument | null = null

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
    if (!loading) void drain()
  })
} else {
  ui.showError(t('parseFailed'))
}
