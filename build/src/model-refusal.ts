import { type BudgetExcess, gltfBudgetExcess } from './gltf-budget.ts'
import {
  type GltfDocument,
  type GltfModelData,
  glbLayoutProblem,
  glbTruncation,
  gltfBuffersFitContainer,
  gltfExternalResources,
  gltfUnsupportedRequiredExtensions,
  readGlbBinChunk,
  readGltfDocument
} from './gltf-document-inspection.ts'
import { validateGltfStructure } from './gltf-validation.ts'

/** Why a model cannot be shown, as data; the page turns it into a message in its own locale. */
export type Refusal =
  | { kind: 'truncated'; actualBytes: number; declaredBytes: number }
  | { kind: 'corrupt'; path: string; reason: string }
  | { kind: 'parseFailed' }
  | { kind: 'unsupportedExtensions'; extensions: string[] }
  | { kind: 'externalBuffers'; files: string[] }
  | { kind: 'budget'; excess: BudgetExcess }

export type ModelCheck = { document: GltfDocument; refusal: null } | { document: null; refusal: Refusal }

const refused = (refusal: Refusal): ModelCheck => ({ document: null, refusal })

/** Reads the document and runs every check that needs only its bytes and JSON. */
export function checkModel(data: GltfModelData): ModelCheck {
  const truncation = glbTruncation(data)
  if (truncation) return refused({ kind: 'truncated', ...truncation })
  const layout = glbLayoutProblem(data)
  if (layout) return refused({ kind: 'corrupt', path: 'GLB', reason: layout })
  const document = readGltfDocument(data)
  if (!document) return refused({ kind: 'parseFailed' })
  const bin = readGlbBinChunk(data)
  const structure = validateGltfStructure(document, bin?.byteLength ?? null)
  if (structure) return refused({ kind: 'corrupt', ...structure })
  if (!gltfBuffersFitContainer(document, typeof data !== 'string')) return refused({ kind: 'parseFailed' })
  const extensions = gltfUnsupportedRequiredExtensions(document)
  if (extensions.length > 0) return refused({ kind: 'unsupportedExtensions', extensions })
  const { buffers } = gltfExternalResources(document)
  if (buffers.length > 0) return refused({ kind: 'externalBuffers', files: buffers })
  const excess = gltfBudgetExcess(document, bin)
  return excess ? refused({ kind: 'budget', excess }) : { document, refusal: null }
}
