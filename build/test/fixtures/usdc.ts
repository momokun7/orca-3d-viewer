// Binary USD (USDC, "crate") layers written in memory, in the layout OpenUSD writes (version 0.8.0):
// values, then the TOKENS, STRINGS, FIELDS, FIELDSETS, PATHS and SPECS sections, then their table.
// Compressed data is stored as LZ4 literals, which every LZ4 reader accepts.

export type CrateValue =
  | { token: string }
  | { asset: string }
  | { double: number }
  | { specifier: number }
  | { ints: number[] }
  | { vec3f: number[] }
  | { tokens: string[] }
  /** A value rep as given, for values the writer cannot make. */
  | { rep: [lo: number, hi: number] }
  /** Bytes made for the offset they land at, pointed to by a rep with `hi` as its upper half. */
  | { raw: (at: number) => Uint8Array; hi: number }
export type CrateSpec = { path: string; type: number; fields: [string, CrateValue][] }
export type Crate = {
  bytes: Uint8Array
  /** Where each section starts, by name. */
  sections: Map<string, number>
  /** Where the data of each value stored outside its rep starts, by "path field". */
  values: Map<string, number>
}

export const SPEC = { attribute: 1, prim: 6, pseudoRoot: 7 } as const
export const TYPE = { Int: 3, Float: 8, Double: 9, Token: 11, AssetPath: 12, Vec3f: 24, TokenVector: 41, Specifier: 42, TimeSamples: 46, DoubleVector: 48 } as const
export const ARRAY = 0x80000000
export const INLINED = 0x40000000
export const COMPRESSED = 0x20000000

export class Writer {
  private bytes = new Uint8Array(1024)
  length = 0
  private room(size: number): void {
    if (this.length + size <= this.bytes.length) return
    const grown = new Uint8Array(Math.max(this.bytes.length * 2, this.length + size))
    grown.set(this.bytes.subarray(0, this.length))
    this.bytes = grown
  }
  put(data: Uint8Array): void {
    this.room(data.length)
    this.bytes.set(data, this.length)
    this.length += data.length
  }
  u32(value: number): void {
    const data = new Uint8Array(4)
    new DataView(data.buffer).setUint32(0, value >>> 0, true)
    this.put(data)
  }
  i32(value: number): void {
    this.u32(value | 0)
  }
  u64(value: number): void {
    this.u32(value % 2 ** 32)
    this.u32(Math.floor(value / 2 ** 32))
  }
  f32(value: number): void {
    const data = new Uint8Array(4)
    new DataView(data.buffer).setFloat32(0, value, true)
    this.put(data)
  }
  f64(value: number): void {
    const data = new Uint8Array(8)
    new DataView(data.buffer).setFloat64(0, value, true)
    this.put(data)
  }
  done(): Uint8Array {
    return this.bytes.slice(0, this.length)
  }
}

/** `data` as TfFastCompression frames it: one chunk (a zero byte), then an LZ4 block of literals. */
export function fastCompressed(data: Uint8Array): Uint8Array {
  const out = new Writer()
  out.put(new Uint8Array([0, Math.min(data.length, 15) << 4]))
  if (data.length >= 15) {
    let rest = data.length - 15
    for (; rest >= 255; rest -= 255) out.put(new Uint8Array([255]))
    out.put(new Uint8Array([rest]))
  }
  out.put(data)
  return out.done()
}

/** `ints` as crate integer compression stores them: each one a 32-bit difference from the last. */
export function compressedIntegers(ints: number[]): Uint8Array {
  const encoded = new Writer()
  encoded.i32(0)
  encoded.put(new Uint8Array((ints.length * 2 + 7) >> 3).fill(0xff))
  let previous = 0
  for (const value of ints) {
    encoded.i32(value - previous)
    previous = value
  }
  return fastCompressed(encoded.done())
}

/**
 * A crate layer holding `specs`, whose paths must form a tree under "/". `version` and `jumps`
 * replace what the writer would store, for layers it would not write.
 */
export function crate(specs: CrateSpec[], { version = 8, jumps: rejump }: { version?: number; jumps?: (jumps: number[]) => number[] } = {}): Crate {
  const tokens = ['']
  const token = (text: string): number => {
    const found = tokens.indexOf(text)
    return found >= 0 ? found : tokens.push(text) - 1
  }
  const out = new Writer()
  out.put(new TextEncoder().encode('PXR-USDC'))
  out.put(new Uint8Array([0, version, 0, 0, 0, 0, 0, 0]))
  out.u64(0)
  out.put(new Uint8Array(64))

  const values = new Map<string, number>()
  const rep = (key: string, value: CrateValue): [number, number] => {
    if ('rep' in value) return value.rep
    if ('token' in value) return [token(value.token), INLINED | (TYPE.Token << 16)]
    if ('asset' in value) return [token(value.asset), INLINED | (TYPE.AssetPath << 16)]
    if ('specifier' in value) return [value.specifier, INLINED | (TYPE.Specifier << 16)]
    const at = out.length
    values.set(key, at)
    if ('raw' in value) {
      out.put(value.raw(at))
      return [at, value.hi]
    }
    if ('double' in value) {
      out.f64(value.double)
      return [at, TYPE.Double << 16]
    }
    if ('tokens' in value) {
      out.u64(value.tokens.length)
      for (const text of value.tokens) out.u32(token(text))
      return [at, TYPE.TokenVector << 16]
    }
    if ('ints' in value) {
      out.u64(value.ints.length)
      for (const item of value.ints) out.i32(item)
      return [at, ARRAY | (TYPE.Int << 16)]
    }
    out.u64(value.vec3f.length / 3)
    for (const item of value.vec3f) out.f32(item)
    return [at, ARRAY | (TYPE.Vec3f << 16)]
  }

  const fields: { name: number; rep: [number, number] }[] = []
  const fieldSets: number[] = []
  const specStarts: number[] = []
  for (const spec of specs) {
    specStarts.push(fieldSets.length)
    for (const [name, value] of spec.fields) {
      fieldSets.push(fields.length)
      fields.push({ name: token(name), rep: rep(`${spec.path} ${name}`, value) })
    }
    fieldSets.push(-1)
  }

  // The path tree in pre-order, with each entry's jump: -2 a leaf, -1 a child next, 0 a sibling
  // next, and above 0 a child next and a sibling that far ahead.
  const parentOf = (path: string): string => {
    const cut = Math.max(path.lastIndexOf('/'), path.lastIndexOf('.'))
    return cut <= 0 ? '/' : path.slice(0, cut)
  }
  const children = new Map<string, string[]>(specs.map((spec) => [spec.path, []]))
  for (const spec of specs) if (spec.path !== '/') children.get(parentOf(spec.path))?.push(spec.path)
  const order: string[] = []
  const visit = (path: string): void => {
    order.push(path)
    for (const child of children.get(path) ?? []) visit(child)
  }
  visit('/')
  const jumps = order.map((path, index) => {
    const siblings = path === '/' ? [] : (children.get(parentOf(path)) ?? [])
    const sibling = siblings[siblings.indexOf(path) + 1]
    const hasChild = (children.get(path) ?? []).length > 0
    if (hasChild && sibling) return order.indexOf(sibling) - index
    return hasChild ? -1 : sibling ? 0 : -2
  })
  const elements = order.map((path) => {
    if (path === '/') return 0
    const cut = Math.max(path.lastIndexOf('/'), path.lastIndexOf('.'))
    const name = token(path.slice(cut + 1))
    return path[cut] === '.' ? -name : name
  })

  const sections = new Map<string, [number, number]>()
  const section = (name: string, write: () => void): void => {
    const start = out.length
    write()
    sections.set(name, [start, out.length - start])
  }
  const integers = (ints: number[]): void => {
    const data = compressedIntegers(ints)
    out.u64(data.length)
    out.put(data)
  }
  section('TOKENS', () => {
    const text = new TextEncoder().encode(tokens.map((item) => `${item}\0`).join(''))
    const data = fastCompressed(text)
    out.u64(tokens.length)
    out.u64(text.length)
    out.u64(data.length)
    out.put(data)
  })
  section('STRINGS', () => out.u64(0))
  section('FIELDS', () => {
    out.u64(fields.length)
    integers(fields.map((field) => field.name))
    const reps = new Writer()
    for (const field of fields) {
      reps.u32(field.rep[0])
      reps.u32(field.rep[1])
    }
    const data = fastCompressed(reps.done())
    out.u64(data.length)
    out.put(data)
  })
  section('FIELDSETS', () => {
    out.u64(fieldSets.length)
    integers(fieldSets)
  })
  section('PATHS', () => {
    out.u64(order.length)
    out.u64(order.length)
    integers(order.map((_, index) => index))
    integers(elements)
    integers(rejump ? rejump(jumps) : jumps)
  })
  section('SPECS', () => {
    out.u64(specs.length)
    integers(specs.map((spec) => order.indexOf(spec.path)))
    integers(specStarts)
    integers(specs.map((spec) => spec.type))
  })
  const toc = out.length
  out.u64(sections.size)
  for (const [name, [start, size]] of sections) {
    const label = new Uint8Array(16)
    label.set(new TextEncoder().encode(name))
    out.put(label)
    out.u64(start)
    out.u64(size)
  }
  const bytes = out.done()
  new DataView(bytes.buffer).setUint32(16, toc, true)
  return { bytes, sections: new Map([...sections].map(([name, [start]]) => [name, start])), values }
}

/** A Y-up layer whose root Xform holds one triangle, with `metersPerUnit` stated when given. */
export function triangleSpecs({ metersPerUnit }: { metersPerUnit?: number } = {}): CrateSpec[] {
  const unit: [string, CrateValue][] = metersPerUnit === undefined ? [] : [['metersPerUnit', { double: metersPerUnit }]]
  return [
    { path: '/', type: SPEC.pseudoRoot, fields: [['defaultPrim', { token: 'Root' }], ...unit, ['upAxis', { token: 'Y' }], ['primChildren', { tokens: ['Root'] }]] },
    { path: '/Root', type: SPEC.prim, fields: [['specifier', { specifier: 0 }], ['typeName', { token: 'Xform' }], ['primChildren', { tokens: ['Tri'] }]] },
    {
      path: '/Root/Tri',
      type: SPEC.prim,
      fields: [['specifier', { specifier: 0 }], ['typeName', { token: 'Mesh' }], ['properties', { tokens: ['faceVertexCounts', 'faceVertexIndices', 'points'] }]]
    },
    { path: '/Root/Tri.faceVertexCounts', type: SPEC.attribute, fields: [['typeName', { token: 'int[]' }], ['default', { ints: [3] }]] },
    { path: '/Root/Tri.faceVertexIndices', type: SPEC.attribute, fields: [['typeName', { token: 'int[]' }], ['default', { ints: [0, 1, 2] }]] },
    { path: '/Root/Tri.points', type: SPEC.attribute, fields: [['typeName', { token: 'point3f[]' }], ['default', { vec3f: [0, 0, 0, 1, 0, 0, 0, 1, 0] }]] }
  ]
}
