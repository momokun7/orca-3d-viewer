import {
  type GltfModelData,
  gltfExternalResources,
  readGltfDocument
} from './gltf-document-inspection.ts'
import { parseGltfModel } from './gltf-model-parse.ts'
import { createTranslate } from './messages.ts'
import { createModelScene, disposeGltfModel, type ModelSceneHandle } from './model-scene.ts'
import { editorFrame, type OrcaDocument } from './orca-editor-host.ts'
import { createViewerUi } from './viewer-ui.ts'

const frame = editorFrame()
const locale = frame?.locale ?? navigator.language
const t = createTranslate(locale)
const root = document.getElementById('app')
if (!root) {
  throw new Error('index.html has no #app element')
}
const ui = createViewerUi(root, t, locale)

let scene: ModelSceneHandle | null = null
let generation = 0

function modelData(content: OrcaDocument['content']): GltfModelData {
  return content.kind === 'bytes' ? content.bytes : content.text
}

async function show(orcaDocument: OrcaDocument): Promise<void> {
  const current = ++generation
  scene?.dispose()
  scene = null
  ui.showLoading()

  const data = modelData(orcaDocument.content)
  const gltf = readGltfDocument(data)
  if (!gltf) {
    ui.showError(t('parseFailed'))
    return
  }
  const external = gltfExternalResources(gltf)
  if (external.buffers.length > 0) {
    ui.showError(t('externalBuffers', { files: external.buffers.join(', ') }))
    return
  }
  try {
    const model = await parseGltfModel(data, gltf)
    if (current !== generation) {
      disposeGltfModel(model)
      return
    }
    const handle = createModelScene(ui.viewport, model, () => {
      scene?.dispose()
      scene = null
      ui.showError(t('contextLost'))
    })
    scene = handle
    // Why autoplay: a still frame cannot show whether the clips were exported at all.
    handle.playAnimation(0)
    ui.showModel(
      {
        stats: handle.stats,
        dimensions: handle.dimensions,
        gridCellSize: handle.gridCellSize,
        animationNames: handle.animationNames
      },
      handle,
      external.images.length > 0 ? t('externalImages', { files: external.images.join(', ') }) : null
    )
  } catch (error) {
    if (current === generation) {
      console.error('glTF Viewer: could not parse the model', error)
      ui.showError(t('parseFailed'))
    }
  }
}

if (frame?.document) {
  // Called with the current document right away, then again whenever the file changes on disk.
  frame.document.onDidChange((orcaDocument) => void show(orcaDocument))
} else {
  ui.showError(t('parseFailed'))
}
