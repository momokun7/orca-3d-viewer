// Walks a binary FBX file the way FBXLoader will, before it does, and refuses one it cannot hold.
// FBXLoader reads the node tree recursively, inflates every compressed array with no limit on its
// output, and stores nodes by the names the file gives them. This walk does the same reading with
// limits: nesting depth, node count, every offset inside its parent, each compressed array inflated
// in small steps and stopped once it passes its declared length, names that would replace an object
// prototype, and the sizes of embedded images. It also reads the file's unit, which the loader keeps
// but does not apply.
import { Unzlib } from 'three/examples/jsm/libs/fflate.module.js'
import { bytesSource } from './byte-sources.ts'
import { BUDGET, type BudgetExcess } from './gltf-budget.ts'
import { decodableUnmeasured, imageSize } from './image-dimensions.ts'
import { RESERVED_NAMES } from './mesh-budget.ts'
import { FBX_BINARY_MAGIC, latin1 } from './model-format.ts'

export type FbxFacts = { metersPerUnit: number }
export type FbxProblem =
  | { corrupt: string }
  | { excess: BudgetExcess }
  | { textFormat: true }
  | { version: number }
export type FbxVerdict = { facts: FbxFacts; problem: null } | { facts: null; problem: FbxProblem }

/** FBXLoader reads binary files from 7.0; older ones it cannot build a scene from. */
export const FBX_MIN_VERSION = 7000
export const FBX_LIMITS = { depth: 64, nodes: 2_000_000 } as const
// The loader inflates in one call; here at most this much compressed input goes in per step.
const INFLATE_STEP = 4096
// Per polygon corner the loader builds about this many numbers (position, normal, UVs, colour,
// skin weights and indices, material) in JavaScript arrays, then typed arrays.
const NUMBERS_PER_CORNER = 20
const BUILD_BYTES_PER_NUMBER = 12
const ARRAY_ITEM_BYTES: Record<string, number> = { b: 1, c: 1, i: 4, f: 4, d: 8, l: 8 }
const SCALAR_BYTES: Record<string, number> = { C: 1, Y: 2, I: 4, F: 4, D: 8, L: 8 }
const MIPMAPPED = 4 / 3

class Refused extends Error {
  readonly problem: FbxProblem
  constructor(problem: FbxProblem) {
    super('refused')
    this.problem = problem
  }
}

const fail = (reason: string): never => {
  throw new Refused({ corrupt: reason })
}

/** Inflates `compressed` in steps, failing once the output passes `limit` bytes; returns its length. */
function inflatedLength(compressed: Uint8Array, limit: number): number {
  let length = 0
  const stream = new Unzlib({}, (chunk) => {
    length += chunk.length
    if (length > limit) fail('a compressed array inflates past its declared length')
  })
  for (let at = 0; at < compressed.length; at += INFLATE_STEP) {
    stream.push(compressed.subarray(at, at + INFLATE_STEP), at + INFLATE_STEP >= compressed.length)
  }
  if (compressed.length === 0) fail('a compressed array is empty')
  return length
}

type Counts = {
  nodes: number
  arrayBytes: number
  corners: number
  shapes: number
  curveNodes: number
  images: number
  imageBytes: number
  unitScale: number | null
}

export function checkFbx(data: ArrayBuffer, timeLimitMs = BUDGET.checkMilliseconds * 4): FbxVerdict {
  const bytes = new Uint8Array(data)
  const view = new DataView(data)
  const head = latin1(bytes.subarray(0, Math.min(bytes.length, 4096)))
  if (!head.startsWith(FBX_BINARY_MAGIC)) {
    const text = /FBXHeaderExtension|^\s*;\s*FBX/m.test(head)
    return { facts: null, problem: text ? { textFormat: true } : { corrupt: 'it is not an FBX file' } }
  }
  if (bytes.length < 27) return { facts: null, problem: { corrupt: 'the file ends inside its header' } }
  const version = view.getUint32(23, true)
  if (version < FBX_MIN_VERSION) return { facts: null, problem: { version } }
  const wide = version >= 7500
  const recordHeader = wide ? 25 : 13
  const deadline = performance.now() + timeLimitMs
  const counts: Counts = { nodes: 0, arrayBytes: 0, corners: 0, shapes: 0, curveNodes: 0, images: 0, imageBytes: 0, unitScale: null }

  const uint = (at: number): number => {
    if (at + (wide ? 8 : 4) > bytes.length) fail('a node header runs past the end of the file')
    if (!wide) return view.getUint32(at, true)
    const value = view.getBigUint64(at, true)
    return value > BigInt(Number.MAX_SAFE_INTEGER) ? fail('a node offset is out of range') : Number(value)
  }

  /** Reads one property at `at`, returns where the next one starts and, for a string, its text. */
  const property = (at: number, end: number, onImage: boolean): { next: number; text: string | null; number: number | null } => {
    if (at >= end) fail('a node declares more properties than it holds')
    const type = String.fromCharCode(bytes[at])
    at++
    if (type in SCALAR_BYTES) {
      const size = SCALAR_BYTES[type]
      if (at + size > end) fail('a property runs past its node')
      const number = type === 'D' ? view.getFloat64(at, true) : type === 'F' ? view.getFloat32(at, true) : null
      return { next: at + size, text: null, number }
    }
    if (type === 'S' || type === 'R') {
      if (at + 4 > end) fail('a property runs past its node')
      const length = view.getUint32(at, true)
      const start = at + 4
      if (start + length > end) fail('a property runs past its node')
      if (type === 'R' && onImage) measureImage(bytes.subarray(start, start + length))
      return { next: start + length, text: type === 'S' ? latin1(bytes.subarray(start, start + length)) : null, number: null }
    }
    if (type in ARRAY_ITEM_BYTES) {
      if (at + 12 > end) fail('an array header runs past its node')
      const items = view.getUint32(at, true)
      const encoding = view.getUint32(at + 4, true)
      const stored = view.getUint32(at + 8, true)
      const start = at + 12
      if (start + stored > end) fail('an array runs past its node')
      const declared = items * ARRAY_ITEM_BYTES[type]
      // Why before inflating: the declared length is what inflating is allowed to reach.
      counts.arrayBytes += declared
      if (counts.arrayBytes > BUDGET.geometryBytes) {
        throw new Refused({ excess: { kind: 'geometryBytes', value: counts.arrayBytes, limit: BUDGET.geometryBytes } })
      }
      if (encoding === 0) {
        if (declared > stored) fail('an array holds fewer items than it declares')
      } else if (encoding === 1) {
        if (inflatedLength(bytes.subarray(start, start + stored), declared) < declared) {
          fail('a compressed array holds fewer items than it declares')
        }
      } else fail(`an array has the unknown encoding ${encoding}`)
      return { next: start + stored, text: null, number: items }
    }
    return fail(`a property has the unknown type ${JSON.stringify(type)}`)
  }

  const measureImage = (image: Uint8Array): void => {
    if (image.length === 0) return
    const index = counts.images++
    if (counts.images > BUDGET.images) {
      throw new Refused({ excess: { kind: 'images', value: counts.images, limit: BUDGET.images } })
    }
    const size = imageSize(bytesSource(image))
    if (!size) {
      // TGA, TIFF and other formats the browser cannot decode simply do not show.
      if (decodableUnmeasured(image)) {
        throw new Refused({ excess: { kind: 'unreadableImage', index } })
      }
      return
    }
    const side = Math.max(size.width, size.height)
    if (side > BUDGET.imageSide) {
      throw new Refused({ excess: { kind: 'imageSide', value: side, limit: BUDGET.imageSide, ...size } })
    }
    counts.imageBytes += size.width * size.height * 4 * MIPMAPPED
    if (counts.imageBytes > BUDGET.gpuBytes) {
      throw new Refused({ excess: { kind: 'gpuBytes', value: counts.imageBytes, limit: BUDGET.gpuBytes } })
    }
  }

  // Each frame is a node whose children are still being read: where they end, and its name.
  const parents: { end: number; name: string }[] = []
  const sections = new Set<string>()
  let at = 27
  // The loader stops 160 bytes and an alignment pad before the end, where the footer starts.
  const contentEnd = (): boolean =>
    bytes.length % 16 === 0 ? ((at + 176) & ~0xf) >= bytes.length : at + 176 >= bytes.length
  try {
    while (parents.length > 0 || !contentEnd()) {
      const parent = parents.at(-1)
      if (parent && at >= parent.end) {
        if (at > parent.end) fail('a node runs past its parent')
        parents.pop()
        continue
      }
      const limit = parent?.end ?? bytes.length
      const end = uint(at)
      const propertyCount = uint(at + (wide ? 8 : 4))
      const propertyBytes = uint(at + (wide ? 16 : 8))
      if (at + recordHeader > limit) fail('a node header runs past its parent')
      const nameLength = bytes[at + recordHeader - 1]
      const nameStart = at + recordHeader
      if (end === 0) {
        at = nameStart + nameLength
        continue
      }
      const propertiesStart = nameStart + nameLength
      if (end <= at || end > limit || propertiesStart + propertyBytes > end) fail('a node ends outside its parent')
      const name = latin1(bytes.subarray(nameStart, propertiesStart))
      if (RESERVED_NAMES.has(name)) fail(`a node is named ${name}`)
      if (!parent) sections.add(name)
      if (++counts.nodes > FBX_LIMITS.nodes) fail(`it has more than ${FBX_LIMITS.nodes} nodes`)
      if (parents.length >= FBX_LIMITS.depth) fail(`its nodes nest deeper than ${FBX_LIMITS.depth}`)
      if ((counts.nodes & 0x3ff) === 0 && performance.now() > deadline) throw new Refused({ excess: { kind: 'tooComplex' } })

      const propertiesEnd = propertiesStart + propertyBytes
      const values: { text: string | null; number: number | null }[] = []
      let cursor = propertiesStart
      for (let index = 0; index < propertyCount; index++) {
        const read = property(cursor, propertiesEnd, name === 'Content' && parent?.name === 'Video')
        values.push(read)
        cursor = read.next
      }
      if (cursor !== propertiesEnd) fail('a node holds more property bytes than its properties')

      if (name === 'P' && parent?.name === 'Properties70') {
        const key = values[0]?.text ?? ''
        if (RESERVED_NAMES.has(key.replace(/^Lcl /, 'Lcl_'))) fail(`a property is named ${key}`)
        if (key === 'UnitScaleFactor' && parents.some((frame) => frame.name === 'GlobalSettings')) {
          counts.unitScale = values[4]?.number ?? null
        }
      }
      if (name === 'PolygonVertexIndex') counts.corners += values[0]?.number ?? 0
      if (name === 'Indexes') counts.shapes++
      if (name === 'AnimationCurveNode') counts.curveNodes++

      at = propertiesEnd
      parents.push({ end, name })
    }
  } catch (error) {
    if (error instanceof Refused) return { facts: null, problem: error.problem }
    return { facts: null, problem: { corrupt: error instanceof Error ? error.message : String(error) } }
  }

  // FBXLoader reads both without checking that they are there.
  for (const section of ['Objects', 'Connections']) {
    if (!sections.has(section)) return { facts: null, problem: { corrupt: `it has no ${section} section` } }
  }

  // Polygons become triangle fans: at most three drawn corners per stored corner.
  const drawn = counts.corners * 3 * (1 + counts.shapes)
  const built = (counts.corners * 3 * NUMBERS_PER_CORNER + counts.corners * 3 * 3 * counts.shapes) * BUILD_BYTES_PER_NUMBER
  const excess: BudgetExcess | null =
    built + counts.arrayBytes + counts.imageBytes > BUDGET.totalBytes
      ? { kind: 'totalBytes', value: built + counts.arrayBytes + counts.imageBytes, limit: BUDGET.totalBytes }
      : drawn > BUDGET.drawnVertices
        ? { kind: 'drawnVertices', value: drawn, limit: BUDGET.drawnVertices }
        : counts.curveNodes > BUDGET.animationTracks
          ? { kind: 'animationTracks', value: counts.curveNodes, limit: BUDGET.animationTracks }
          : null
  if (excess) return { facts: null, problem: { excess } }
  const scale = counts.unitScale
  // UnitScaleFactor is centimetres per unit; FBX defaults to centimetres.
  const metersPerUnit = scale !== null && Number.isFinite(scale) && scale > 0 ? scale / 100 : 0.01
  return { facts: { metersPerUnit }, problem: null }
}
