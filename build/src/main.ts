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
import { resolveLocale } from './locale.ts'
import { createTranslate } from './messages.ts'
import { disposeObjectTree } from './model-disposal.ts'
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
let generation = 0
let shownVersion: number | null = null
let lastShown: { summary: ModelSummary; notices: string[] } | null = null

function modelData(content: OrcaDocument['content']): GltfModelData {
  return content.kind === 'bytes' ? content.bytes : content.text
}

function budgetMessage(excess: BudgetExcess): string {
  switch (excess.kind) {
    case 'accessorBytes':
      return t('tooLargeAccessorBytes', { value: formatBytes(excess.value, locale), limit: formatBytes(excess.limit, locale) })
    case 'nodes':
      return t('tooManyNodes', { value: formatCount(excess.value, locale), limit: formatCount(excess.limit, locale) })
    case 'drawCalls':
      return t('tooManyDrawCalls', { value: formatCount(excess.value, locale), limit: formatCount(excess.limit, locale) })
    case 'imageSide':
      return t('imageTooLarge', {
        width: formatCount(excess.width, locale),
        height: formatCount(excess.height, locale),
        limit: formatCount(excess.limit, locale)
      })
    case 'imagePixels':
      return t('tooManyImagePixels', { value: formatCount(excess.value, locale), limit: formatCount(excess.limit, locale) })
    case 'accessorOutOfRange':
      return t('accessorOutOfRange', { index: excess.index })
  }
}

const more = (list: string, count: number): string => t('moreFiles', { list, count: formatCount(count, locale) })

/** Why the document cannot be shown at all, found from its bytes and JSON alone; null when it may load. */
function refusal(data: GltfModelData, gltf: GltfDocument | null): string | null {
  const truncation = glbTruncation(data)
  if (truncation) {
    return t('truncated', {
      actual: formatCount(truncation.actualBytes, locale),
      declared: formatCount(truncation.declaredBytes, locale)
    })
  }
  if (!gltf || !gltfBuffersFitContainer(gltf, typeof data !== 'string')) return t('parseFailed')
  const unsupported = gltfUnsupportedRequiredExtensions(gltf)
  if (unsupported.length > 0) return t('unsupportedExtensions', { extensions: nameList(unsupported, more) })
  const { buffers } = gltfExternalResources(gltf)
  if (buffers.length > 0) return t('externalBuffers', { files: nameList(buffers, more) })
  const excess = gltfBudgetExcess(gltf, readGlbBinChunk(data))
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

function fail(message: string, log: string, error: unknown): void {
  console.error(log, error)
  stage?.clear()
  lastShown = null
  shownVersion = null
  ui.showError(message)
}

async function show(orcaDocument: OrcaDocument): Promise<void> {
  // Why: Orca may resend the version on screen; reloading it would only flash and reset the view.
  if (orcaDocument.version === shownVersion && lastShown) return
  const current = ++generation
  try {
    await load(orcaDocument, current)
  } finally {
    // Why: the old model stays up while a new one loads, so "settled" needs its own signal for tests and tools.
    if (current === generation) document.documentElement.dataset.shownVersion = String(orcaDocument.version)
  }
}

async function load(orcaDocument: OrcaDocument, current: number): Promise<void> {
  const replacing = lastShown !== null
  // Why keep the old model up while the new one loads: an agent re-exporting a file should not flash it.
  if (!replacing) ui.showLoading()

  const data = modelData(orcaDocument.content)
  const gltf = readGltfDocument(data)
  const refused = refusal(data, gltf)
  if (refused || !gltf) {
    stage?.clear()
    lastShown = null
    shownVersion = null
    ui.showError(refused ?? t('parseFailed'))
    return
  }

  let model: Awaited<ReturnType<typeof parseGltfModel>>
  try {
    model = await parseGltfModel(data, gltf)
  } catch (error) {
    if (current === generation) {
      fail(t(error instanceof ParseTimeoutError ? 'parseTimeout' : 'parseFailed'), PARSE_FAILURE_LOG, error)
    }
    return
  }
  if (current !== generation) {
    disposeObjectTree(model.scene)
    return
  }

  let target: ModelStage
  try {
    target = stageFor()
  } catch (error) {
    disposeObjectTree(model.scene)
    fail(t('webglUnavailable'), RENDER_FAILURE_LOG, error)
    return
  }
  try {
    const summary = target.show(model, replacing)
    const notices = [
      ...(gltfExternalResources(gltf).images.length > 0
        ? [t('externalImages', { files: nameList(gltfExternalResources(gltf).images, more) })]
        : []),
      ...(summary.otherSceneCount > 0 ? [t('otherScenes', { count: formatCount(summary.otherSceneCount, locale) })] : [])
    ]
    ui.showModel(summary, target, notices, replacing)
    // Why autoplay: a still frame cannot show whether the clips were exported at all.
    target.playAnimation(0)
    lastShown = { summary, notices }
    shownVersion = orcaDocument.version
  } catch (error) {
    disposeObjectTree(model.scene)
    fail(t('renderFailed'), RENDER_FAILURE_LOG, error)
  }
}

if (frame?.document) {
  // Called with the current document right away, then again whenever the file changes on disk.
  frame.document.onDidChange((orcaDocument) => {
    show(orcaDocument).catch((error: unknown) => fail(t('renderFailed'), RENDER_FAILURE_LOG, error))
  })
} else {
  ui.showError(t('parseFailed'))
}
