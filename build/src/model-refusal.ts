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
import { checkFbx } from './fbx-inspection.ts'
import { checkObj, checkPly, checkStl, type MeshFacts } from './mesh-budget.ts'
import type { MeshFormat, ModelFormat } from './model-format.ts'
import { checkUsd } from './usd-inspection.ts'

/** Why a model cannot be shown, as data; the page turns it into a message in its own locale. */
export type Refusal =
  | { kind: 'truncated'; actualBytes: number; declaredBytes: number }
  | { kind: 'corrupt'; path: string; reason: string }
  | { kind: 'parseFailed' }
  | { kind: 'unsupportedExtensions'; extensions: string[] }
  | { kind: 'externalBuffers'; files: string[] }
  | { kind: 'budget'; excess: BudgetExcess }
  | { kind: 'corruptFile'; format: string; reason: string }
  | { kind: 'fbxText' }
  | { kind: 'fbxVersion'; version: number }
  | { kind: 'usdCompressed' }

/**
 * What a mesh file that passed tells its parse: its scale, whether that scale is assumed, and the
 * files it names beside itself.
 */
export type MeshCheck = MeshFacts & {
  format: MeshFormat
  metersPerUnit: number | null
  unitAssumed: boolean
  externalFiles: string[]
  externalLayers: string[]
}

export type ModelCheck =
  | { document: GltfDocument; mesh: null; refusal: null }
  | { document: null; mesh: MeshCheck; refusal: null }
  | { document: null; mesh: null; refusal: Refusal }

const refused = (refusal: Refusal): ModelCheck => ({ document: null, mesh: null, refusal })
const FORMAT_NAMES: Record<MeshFormat, string> = { stl: 'STL', ply: 'PLY', obj: 'OBJ', fbx: 'FBX', usd: 'USD' }
// USD's own fallback when a layer states no metersPerUnit: centimetres.
export const USD_DEFAULT_METERS_PER_UNIT = 0.01

const passed = (format: MeshFormat, facts: Partial<MeshCheck>): ModelCheck => ({
  document: null,
  mesh: { format, metersPerUnit: null, unitAssumed: false, externalFiles: [], externalLayers: [], materialFiles: false, ...facts },
  refusal: null
})

/** Runs every check a model of `format` needs before it is parsed. */
export function checkModel(format: ModelFormat, data: GltfModelData): ModelCheck {
  return format === 'gltf' ? checkGltf(data) : checkMesh(format, data)
}

function checkMesh(format: MeshFormat, data: GltfModelData): ModelCheck {
  if (format === 'usd') {
    const usd = checkUsd(data)
    if (usd.facts) {
      // Why 1 when stated: USDLoader applies a stated metersPerUnit itself.
      const stated = usd.facts.metersPerUnit !== null
      return passed(format, {
        metersPerUnit: stated ? 1 : USD_DEFAULT_METERS_PER_UNIT,
        unitAssumed: !stated,
        externalFiles: usd.facts.externalFiles,
        externalLayers: usd.facts.externalLayers
      })
    }
    const problem = usd.problem
    if ('compressed' in problem) return refused({ kind: 'usdCompressed' })
    if ('excess' in problem) return refused({ kind: 'budget', excess: problem.excess })
    return refused({ kind: 'corruptFile', format: FORMAT_NAMES[format], reason: problem.corrupt })
  }
  if (format === 'fbx') {
    if (typeof data === 'string') return refused({ kind: 'fbxText' })
    const fbx = checkFbx(data)
    if (fbx.facts) return passed(format, { metersPerUnit: fbx.facts.metersPerUnit })
    const problem = fbx.problem
    if ('textFormat' in problem) return refused({ kind: 'fbxText' })
    if ('version' in problem) return refused({ kind: 'fbxVersion', version: problem.version })
    if ('excess' in problem) return refused({ kind: 'budget', excess: problem.excess })
    return refused({ kind: 'corruptFile', format: FORMAT_NAMES[format], reason: problem.corrupt })
  }
  const bytes = (): ArrayBuffer => (typeof data === 'string' ? new TextEncoder().encode(data).buffer : data)
  const verdict =
    format === 'obj'
      ? checkObj(typeof data === 'string' ? data : new TextDecoder().decode(data))
      : format === 'ply'
        ? checkPly(bytes())
        : checkStl(bytes())
  if (verdict.facts) return passed(format, verdict.facts)
  const problem = verdict.problem
  return 'excess' in problem
    ? refused({ kind: 'budget', excess: problem.excess })
    : refused({ kind: 'corruptFile', format: FORMAT_NAMES[format], reason: problem.corrupt })
}

/** Reads a glTF document and runs every check that needs only its bytes and JSON. */
function checkGltf(data: GltfModelData): ModelCheck {
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
  return excess ? refused({ kind: 'budget', excess }) : { document, mesh: null, refusal: null }
}
