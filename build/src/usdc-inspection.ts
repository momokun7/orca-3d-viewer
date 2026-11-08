// Reads a binary USD (USDC, "crate") layer with three.js's own parser, guarding each stage first.
// The parser trusts the file: it allocates an array as long as a count says before reading it,
// decompresses to whatever size a header names, reads a value again for every spec that shares
// it, and builds each path by copying its parent's. Each guard reads the fields the next stage
// will, from the same bytes, and refuses before that stage allocates or loops more than the
// budget allows. The parse then runs as USDLoader will run it, so the specs it returns are the
// ones the loader composes.
import { type CrateSpecs, USDCParser } from 'three/examples/jsm/loaders/usd/USDCParser.js'
import { BUDGET, type BudgetExcess } from './gltf-budget.ts'

export type CrateVerdict = { specs: CrateSpecs; tokens: string[] } | { corrupt: string } | { excess: BudgetExcess }

export const CRATE_LIMITS = { sections: 64, valueReads: 4_000_000, nesting: 8 } as const
// What the parser needs from the table of contents; STRINGS it does without.
const NEEDED_SECTIONS = ['TOKENS', 'FIELDS', 'FIELDSETS', 'PATHS', 'SPECS']
// Bytes a JavaScript object costs the parser per token, field, spec or time sample it keeps.
const OBJECT_BYTES = 64
// The parser's own cap on the fields it reads per spec.
const FIELDS_PER_SPEC = 10_000

const TYPE = {
  Int: 3,
  UInt: 4,
  Half: 7,
  Float: 8,
  Double: 9,
  Token: 11,
  Matrix4d: 15,
  Quatf: 17,
  Quath: 18,
  Vec2f: 20,
  Vec3f: 24,
  Vec3h: 25,
  Vec4f: 28,
  Dictionary: 31,
  PathListOp: 34,
  PathVector: 40,
  TokenVector: 41,
  VariantSelectionMap: 45,
  TimeSamples: 46,
  DoubleVector: 48
} as const
// Bytes read and bytes allocated per element of an uncompressed array, as the parser reads each type.
const ARRAY_ELEMENT = new Map<number, [read: number, allocated: number]>([
  [TYPE.Int, [4, 4]],
  [TYPE.UInt, [4, 4]],
  [TYPE.Half, [2, 4]],
  [TYPE.Float, [4, 4]],
  [TYPE.Double, [8, 8]],
  [TYPE.Token, [4, 8]],
  [TYPE.Matrix4d, [128, 128]],
  [TYPE.Quatf, [16, 16]],
  [TYPE.Quath, [8, 16]],
  [TYPE.Vec2f, [8, 8]],
  [TYPE.Vec3f, [12, 12]],
  [TYPE.Vec3h, [6, 12]],
  [TYPE.Vec4f, [16, 16]]
])
// PathListOp's lists, in the order the parser reads them: explicit, added, prepended, appended, deleted, reordered.
const PATH_LIST_FLAGS = [0x02, 0x04, 0x20, 0x40, 0x08, 0x10]
const FLOAT_AS_INTS = 0x69
const FLOAT_LOOKUP = 0x74

class Refused extends Error {
  readonly verdict: CrateVerdict
  constructor(verdict: CrateVerdict) {
    super('refused')
    this.verdict = verdict
  }
}

const fail = (reason: string): never => {
  throw new Refused({ corrupt: reason })
}
const over = (excess: BudgetExcess): never => {
  throw new Refused({ excess })
}

type ValueRep = { lo: number; hi: number }

/**
 * The specs of a crate layer, or why it is refused. `deadline` is the Date.now() past which the
 * check gives up on the file as too complex.
 */
export function readCrate(bytes: Uint8Array, name: string, deadline: number): CrateVerdict {
  const buffer = bytes.slice().buffer
  const view = new DataView(buffer)
  const length = buffer.byteLength
  const parser = new USDCParser()

  const need = (at: number, size: number, what: string): void => {
    if (!(at >= 0 && size >= 0 && at + size <= length)) fail(`${what} runs past the end of the file`)
  }
  const u32 = (at: number): number => view.getUint32(at, true)
  const u64 = (at: number): number => view.getUint32(at, true) + view.getUint32(at + 4, true) * 2 ** 32
  const i64 = (at: number): number => view.getUint32(at, true) + view.getInt32(at + 4, true) * 2 ** 32
  const count = (at: number, what: string): number => {
    need(at, 8, what)
    return u64(at)
  }

  let allocated = 0
  const allocate = (size: number): void => {
    allocated += size
    if (allocated > BUDGET.geometryBytes) over({ kind: 'geometryBytes', value: allocated, limit: BUDGET.geometryBytes })
  }
  let reads = 0
  let clockAt = 0
  const work = (steps: number): void => {
    reads += steps
    if (reads > CRATE_LIMITS.valueReads) over({ kind: 'tooComplex' })
    if (reads - clockAt < 4096) return
    clockAt = reads
    if (Date.now() > deadline) over({ kind: 'tooComplex' })
  }

  /** LZ4 data as TfFastCompression frames it: a chunk count, then each chunk's size, which must fit what is there. */
  const compressed = (at: number, size: number, output: number, what: string): void => {
    need(at, size, what)
    const chunks = size > 0 ? view.getUint8(at) : 0
    if (chunks > 0) {
      const header = 1 + chunks * 4
      if (header > size) fail(`${what} is damaged`)
      let total = 0
      for (let chunk = 0; chunk < chunks; chunk++) total += u32(at + 1 + chunk * 4)
      // Why: the parser walks each chunk to the size it states, past the data when it lies.
      if (total > size - header) fail(`${what} is damaged`)
    }
    allocate(output + size)
  }
  /** A compressed run of `ints` integers: its size, then the data. Returns where the next field starts. */
  const integers = (at: number, ints: number, what: string): number => {
    const size = count(at, what)
    // The parser decompresses to the largest encoding of `ints`, then decodes into an Int32Array.
    compressed(at + 8, size, ints * 4 + ((ints * 2 + 7) >> 3) + 4 + ints * 4, what)
    return at + 8 + size
  }
  const section = (name: string): number => parser.sections[name].start

  const readTOC = parser._readTOC.bind(parser)
  parser._readTOC = () => {
    const { major, minor, patch } = parser.version
    if (major === 0 && minor < 4) fail(`it is crate version ${major}.${minor}.${patch}, older than the viewer reads`)
    const sections = count(parser.tocOffset, 'its table of contents')
    if (sections > CRATE_LIMITS.sections) fail(`it lists ${sections} sections`)
    need(parser.tocOffset + 8, sections * 32, 'its table of contents')
    readTOC()
    for (const needed of NEEDED_SECTIONS) {
      if (!Object.hasOwn(parser.sections, needed)) fail(`it has no ${needed} section`)
      const { start, size } = parser.sections[needed]
      need(start, size, `its ${needed} section`)
    }
  }
  const readTokens = parser._readTokens.bind(parser)
  parser._readTokens = () => {
    const at = section('TOKENS')
    const tokens = count(at, 'its tokens')
    const size = count(at + 8, 'its tokens')
    compressed(at + 24, count(at + 16, 'its tokens'), size, 'its tokens')
    // Why: the parser keeps reading tokens past the data, one empty string each, until the count is met.
    if (tokens > size) fail('it lists more tokens than it holds')
    allocate(tokens * OBJECT_BYTES)
    readTokens()
  }
  const readStrings = parser._readStrings.bind(parser)
  parser._readStrings = () => {
    if (Object.hasOwn(parser.sections, 'STRINGS')) {
      const at = section('STRINGS')
      const strings = count(at, 'its strings')
      need(at + 8, strings * 4, 'its strings')
      allocate(strings * 8)
    }
    readStrings()
  }
  const readFields = parser._readFields.bind(parser)
  parser._readFields = () => {
    const at = section('FIELDS')
    const fields = count(at, 'its fields')
    const reps = integers(at + 8, fields, 'its fields')
    compressed(reps + 8, count(reps, 'its fields'), fields * 8, 'its fields')
    allocate(fields * OBJECT_BYTES * 2)
    readFields()
  }
  const readFieldSets = parser._readFieldSets.bind(parser)
  parser._readFieldSets = () => {
    const at = section('FIELDSETS')
    const fieldSets = count(at, 'its field sets')
    integers(at + 8, fieldSets, 'its field sets')
    allocate(fieldSets * 8)
    readFieldSets()
  }
  const readPaths = parser._readPaths.bind(parser)
  parser._readPaths = () => {
    const at = section('PATHS')
    const paths = count(at, 'its paths')
    allocate(paths * 8)
    let next = at + 16
    for (let stream = 0; stream < 3; stream++) next = integers(next, paths, 'its paths')
    readPaths()
  }
  const buildPaths = parser._buildPathsFromCompressed.bind(parser)
  parser._buildPathsFromCompressed = (pathIndices, elementTokenIndices, jumps) => {
    measurePaths(elementTokenIndices, jumps)
    buildPaths(pathIndices, elementTokenIndices, jumps)
  }
  const readSpecs = parser._readSpecs.bind(parser)
  parser._readSpecs = () => {
    const at = section('SPECS')
    const specs = count(at, 'its specs')
    let next = at + 8
    for (let stream = 0; stream < 3; stream++) next = integers(next, specs, 'its specs')
    allocate(specs * OBJECT_BYTES)
    readSpecs()
    measureValues()
  }

  /**
   * Walks the path tree as the parser builds it, adding up the length of every path string instead
   * of making it. A well-formed tree visits each entry once; a jump that leads back over entries
   * already built would have the parser build them again, so it is refused.
   */
  function measurePaths(elementTokenIndices: Int32Array, jumps: Int32Array): void {
    let visits = 0
    const walk = (start: number, parentLength: number): void => {
      let parent = parentLength
      for (let index = start; index < jumps.length; ) {
        const self = index++
        if (++visits > jumps.length) fail('its path tree leads back on itself')
        let pathLength: number
        if (parent === 0) {
          pathLength = 1
          parent = 1
        } else {
          const token = parser.tokens[Math.abs(elementTokenIndices[self])] || ''
          pathLength = parent === 1 && elementTokenIndices[self] >= 0 ? 1 + token.length : parent + 1 + token.length
        }
        allocate(pathLength * 2)
        const jump = jumps[self]
        if (jump > 0 || jump === -1) {
          if (jump >= 0) walk(self + jump, parent)
          parent = pathLength
        } else if (jump !== 0) break
      }
    }
    walk(0, 0)
  }

  /** Adds up what the parser allocates for every value of every spec, reading each as it will. */
  function measureValues(): void {
    const { fieldSets, fields, specs, paths } = parser
    for (const spec of specs) {
      if (!paths[spec.pathIndex]) continue
      let index = spec.fieldSetIndex
      for (let read = 0; index < fieldSets.length && read < FIELDS_PER_SPEC; index++, read++) {
        const fieldIndex = fieldSets[index]
        if (fieldIndex === -1) break
        const field = fields[fieldIndex]
        if (field) measureValue(field.valueRep, 0)
      }
    }
  }

  const repAt = (at: number): ValueRep => ({ lo: u32(at), hi: u32(at + 4) })

  function measureValue(rep: ValueRep, depth: number): void {
    work(1)
    const type = (rep.hi >> 16) & 0xff
    const offset = rep.lo + (rep.hi & 0xffff) * 2 ** 32
    const isArray = (rep.hi & 0x80000000) !== 0
    if (type === TYPE.TimeSamples) {
      if (depth >= CRATE_LIMITS.nesting) fail('its time samples nest too deeply')
      need(offset, 8, 'a time sample')
      const times = offset + i64(offset)
      need(times, 16, 'a time sample')
      measureValue(repAt(times), depth + 1)
      const values = times + 8 + i64(times + 8)
      const samples = count(values, 'a time sample')
      need(values + 8, samples * 8, 'a time sample')
      allocate(samples * OBJECT_BYTES)
      for (let sample = 0; sample < samples; sample++) measureValue(repAt(values + 8 + sample * 8), depth + 1)
      return
    }
    // Why stop here: inlined values hold no data elsewhere, and an offset past the end makes the parser throw.
    if ((rep.hi & 0x40000000) !== 0 || (offset === 0 && isArray) || offset >= length) return
    if (isArray) measureArray(type, offset, (rep.hi & 0x20000000) !== 0)
    else measureScalar(type, offset)
  }

  function measureArray(type: number, at: number, isCompressed: boolean): void {
    const narrow = parser.version.major === 0 && parser.version.minor < 7
    need(at, narrow ? 4 : 8, 'an array')
    const size = narrow ? u32(at) : u64(at)
    if (size === 0 || size > 0x7fffffff) return
    const data = at + (narrow ? 4 : 8)
    if (isCompressed) {
      if (type === TYPE.Int || type === TYPE.UInt) integers(data, size, 'an array')
      else if (type === TYPE.Float) {
        need(data, 1, 'an array')
        const code = view.getInt8(data)
        if (code === FLOAT_AS_INTS) integers(data + 1, size, 'an array')
        else if (code === FLOAT_LOOKUP) {
          need(data + 1, 4, 'an array')
          const entries = u32(data + 1)
          need(data + 5, entries * 4, 'an array')
          allocate(entries * 4)
          integers(data + 5 + entries * 4, size, 'an array')
        }
        allocate(size * 4)
      }
      return
    }
    const element = ARRAY_ELEMENT.get(type)
    if (!element) return
    // Why before: the parser allocates the whole array, then finds the file too short.
    need(data, size * element[0], 'an array')
    allocate(size * element[1])
  }

  function measureScalar(type: number, at: number): void {
    switch (type) {
      case TYPE.TokenVector:
      case TYPE.PathVector:
      case TYPE.DoubleVector: {
        const items = count(at, 'a list')
        need(at + 8, items * (type === TYPE.DoubleVector ? 8 : 4), 'a list')
        allocate(items * 8)
        return
      }
      case TYPE.VariantSelectionMap: {
        const items = count(at, 'a variant selection')
        need(at + 8, items * 8, 'a variant selection')
        allocate(items * 16)
        return
      }
      case TYPE.Dictionary: {
        // The parser reads 20 bytes per entry and keeps none of them.
        const items = count(at, 'a dictionary')
        need(at + 8, items * 20, 'a dictionary')
        work(items)
        return
      }
      case TYPE.PathListOp: {
        need(at, 1, 'a path list')
        const flags = view.getUint8(at)
        let next = at + 1
        for (const flag of PATH_LIST_FLAGS) {
          if ((flags & flag) === 0) continue
          const items = count(next, 'a path list')
          need(next + 8, items * 4, 'a path list')
          allocate(items * 8)
          next += 8 + items * 4
        }
      }
    }
  }

  try {
    const { specsByPath } = parser.parseData(buffer)
    return { specs: specsByPath, tokens: parser.tokens }
  } catch (error) {
    if (error instanceof Refused) return error.verdict
    return { corrupt: `${name || 'the layer'} cannot be read as USD` }
  }
}
