// Refuses an STL, PLY or OBJ file before three.js parses it when it would build more than the viewer
// can hold. These loaders build plain JavaScript arrays first and typed arrays after, and they turn
// shared vertices and polygons into separate triangles, so a small file can still ask for a great
// deal: an OBJ face of a thousand references to one vertex, or a PLY header that declares more rows
// than its body holds. Each check walks the file once, as the loader will, and counts what it builds.
import { BUDGET, type BudgetExcess } from './gltf-budget.ts'
import { latin1 } from './model-format.ts'

/** What a passing file tells the parse: whether it names material files the frame cannot read. */
export type MeshFacts = { materialFiles: boolean }
export type MeshProblem = { corrupt: string } | { excess: BudgetExcess }
export type MeshVerdict = { facts: MeshFacts; problem: null } | { facts: null; problem: MeshProblem }

// Bytes a loader holds per number while it builds: a JavaScript array slot, then the typed array.
const BUILD_BYTES_PER_NUMBER = 12
// Names a parsed record must not take: each loader stores fields by the name the file gives them.
export const RESERVED_NAMES = new Set(['__proto__', 'constructor', 'prototype'])

const pass = (facts: MeshFacts = { materialFiles: false }): MeshVerdict => ({ facts, problem: null })
const corrupt = (reason: string): MeshVerdict => ({ facts: null, problem: { corrupt: reason } })

/** The first budget `numbers` built and `vertices` drawn exceed, or null. */
function buildExcess(numbers: number, vertices: number): BudgetExcess | null {
  const bytes = numbers * BUILD_BYTES_PER_NUMBER
  if (bytes > BUDGET.geometryBytes) return { kind: 'geometryBytes', value: bytes, limit: BUDGET.geometryBytes }
  if (vertices > BUDGET.drawnVertices) return { kind: 'drawnVertices', value: vertices, limit: BUDGET.drawnVertices }
  return null
}

const verdict = (numbers: number, vertices: number, facts?: MeshFacts): MeshVerdict => {
  const excess = buildExcess(numbers, vertices)
  return excess ? { facts: null, problem: { excess } } : pass(facts)
}

// Binary STL: an 80-byte header, a triangle count, then 50 bytes per triangle.
const STL_TRIANGLE_BYTES = 50
const STL_HEADER_BYTES = 84

/** STLLoader's own rule: an exact binary size wins, then "solid" near the start means text. */
export function stlIsText(data: ArrayBuffer): boolean {
  const bytes = new Uint8Array(data)
  const declared = bytes.length >= STL_HEADER_BYTES ? new DataView(data).getUint32(80, true) : -1
  const exact = declared >= 0 && STL_HEADER_BYTES + declared * STL_TRIANGLE_BYTES === bytes.length
  return !exact && /solid/.test(latin1(bytes.subarray(0, 10)))
}

export function checkStl(data: ArrayBuffer): MeshVerdict {
  const bytes = new Uint8Array(data)
  const declared = bytes.length >= STL_HEADER_BYTES ? new DataView(data).getUint32(80, true) : -1
  if (!stlIsText(data)) {
    if (declared < 0) return corrupt('the file is shorter than an STL header')
    if (STL_HEADER_BYTES + declared * STL_TRIANGLE_BYTES > bytes.length) {
      return corrupt(`its header declares ${declared} triangles, more than the file holds`)
    }
    // Position, normal and colour per corner.
    return verdict(declared * 3 * 9, declared * 3)
  }
  const vertices = latin1(bytes).match(/\bvertex\b/g)?.length ?? 0
  return verdict(vertices * 6, vertices)
}

type PlyProperty = { name: string; list: { count: string; item: string } | null; type: string }
type PlyElement = { name: string; count: number; properties: PlyProperty[] }

const PLY_TYPE_BYTES: Record<string, number> = {
  char: 1, uchar: 1, int8: 1, uint8: 1,
  short: 2, ushort: 2, int16: 2, uint16: 2,
  int: 4, uint: 4, int32: 4, uint32: 4, float: 4, float32: 4,
  double: 8, float64: 8
}
const PLY_FORMATS = new Set(['ascii', 'binary_little_endian', 'binary_big_endian'])

function readPlyHeader(text: string): { format: string; elements: PlyElement[]; bodyStart: number } | string {
  const end = /end_header(\r\n|\r|\n)/.exec(text)
  if (!text.startsWith('ply') || !end) return 'it has no PLY header'
  const elements: PlyElement[] = []
  let format = ''
  for (const line of text.slice(3, end.index).split(/\r\n|\r|\n/)) {
    const [keyword, ...values] = line.trim().split(/\s+/)
    if (keyword === 'format') format = values[0] ?? ''
    else if (keyword === 'element') {
      const count = Number(values[1])
      if (!Number.isSafeInteger(count) || count < 0) return `element ${values[0]} has no valid count`
      elements.push({ name: values[0] ?? '', count, properties: [] })
    } else if (keyword === 'property') {
      const element = elements.at(-1)
      if (!element) return 'a property comes before any element'
      const list = values[0] === 'list'
      const property: PlyProperty = list
        ? { name: values[3] ?? '', list: { count: values[1] ?? '', item: values[2] ?? '' }, type: values[2] ?? '' }
        : { name: values[1] ?? '', list: null, type: values[0] ?? '' }
      if (!(property.type in PLY_TYPE_BYTES) || (property.list && !(property.list.count in PLY_TYPE_BYTES))) {
        return `property ${property.name} has an unknown type`
      }
      element.properties.push(property)
    }
  }
  if (!PLY_FORMATS.has(format)) return `the format ${format || '(none)'} is not one PLY defines`
  for (const element of elements) {
    if (RESERVED_NAMES.has(element.name)) return `an element is named ${element.name}`
    // PLYLoader reads a face's corners from one of these and fails without either.
    if (element.name === 'face' && !element.properties.some((property) => property.list && /^vertex_ind(ices|ex)$/.test(property.name))) {
      return 'its faces have no vertex_indices list'
    }
    const reserved = element.properties.find((property) => RESERVED_NAMES.has(property.name))
    if (reserved) return `a property is named ${reserved.name}`
  }
  return { format, elements, bodyStart: end.index + end[0].length }
}

/** Indices drawn for a face of `corners` corners: the loader fans each polygon into triangles. */
const faceIndices = (corners: number): number => Math.max(0, corners - 2) * 3

export function checkPly(data: ArrayBuffer): MeshVerdict {
  const bytes = new Uint8Array(data)
  const text = latin1(bytes)
  const header = readPlyHeader(text)
  if (typeof header === 'string') return corrupt(header)
  let numbers = 0
  let drawn = 0
  if (header.format === 'ascii') {
    const tokens = text.slice(header.bodyStart).matchAll(/\S+/g)
    const next = (): number | null => {
      const token = tokens.next()
      return token.done ? null : Number(token.value[0])
    }
    for (const element of header.elements) {
      for (let row = 0; row < element.count; row++) {
        for (const property of element.properties) {
          const count = next()
          const short = (): MeshVerdict => corrupt(`its ${element.name} rows end before the ${element.count} its header declares`)
          if (count === null) return short()
          if (!property.list) {
            numbers++
            continue
          }
          if (!Number.isSafeInteger(count) || count < 0) return corrupt(`a ${element.name} list has no valid length`)
          for (let item = 0; item < count; item++) if (next() === null) return short()
          numbers += count
          if (element.name === 'face') drawn += faceIndices(count)
        }
      }
    }
  } else {
    const view = new DataView(data)
    const little = header.format === 'binary_little_endian'
    let at = header.bodyStart
    const readCount = (type: string): number | null => {
      const size = PLY_TYPE_BYTES[type]
      if (at + size > bytes.length) return null
      const value =
        size === 1 ? view.getUint8(at) : size === 2 ? view.getUint16(at, little) : size === 4 ? view.getUint32(at, little) : Number.NaN
      at += size
      return Number.isSafeInteger(value) ? value : null
    }
    for (const element of header.elements) {
      const fixed = element.properties.every((property) => !property.list)
      if (fixed) {
        const rowBytes = element.properties.reduce((sum, property) => sum + PLY_TYPE_BYTES[property.type], 0)
        if (at + rowBytes * element.count > bytes.length) {
          return corrupt(`its ${element.name} rows end before the ${element.count} its header declares`)
        }
        at += rowBytes * element.count
        numbers += element.properties.length * element.count
        continue
      }
      for (let row = 0; row < element.count; row++) {
        for (const property of element.properties) {
          const count = property.list ? readCount(property.list.count) : 1
          if (count === null) return corrupt(`its ${element.name} rows end before the ${element.count} its header declares`)
          at += property.list ? count * PLY_TYPE_BYTES[property.type] : PLY_TYPE_BYTES[property.type]
          if (at > bytes.length) return corrupt(`a ${element.name} list runs past the end of the file`)
          numbers += count
          if (element.name === 'face' && property.list) drawn += faceIndices(count)
        }
      }
    }
  }
  return verdict(numbers + drawn, drawn)
}

// Per corner OBJLoader builds a position, normal, UV and colour, each in its own array.
const OBJ_NUMBERS_PER_CORNER = 11

export function checkObj(text: string): MeshVerdict {
  let corners = 0
  let stored = 0
  let materialFiles = false
  for (let start = 0; start < text.length; ) {
    let end = text.indexOf('\n', start)
    if (end === -1) end = text.length
    const line = text.slice(start, end).trim()
    start = end + 1
    const space = line.search(/\s/)
    const keyword = space === -1 ? line : line.slice(0, space)
    const values = space === -1 ? 0 : line.slice(space).trim().split(/\s+/).length
    switch (keyword) {
      case 'v':
      case 'vn':
      case 'vt':
        stored += values
        break
      case 'f':
        corners += faceIndices(values)
        break
      case 'l':
        corners += Math.max(0, values - 1) * 2
        break
      case 'p':
        corners += values
        break
      case 'mtllib':
        materialFiles = true
        break
    }
  }
  // Why refused: text Orca sends without a file type reaches here when it is no other format.
  if (corners === 0) return corrupt('it holds no faces, lines or points')
  return verdict(stored + corners * OBJ_NUMBERS_PER_CORNER, corners, { materialFiles })
}
