// Checks a USD file (a USDZ package, or a USDA layer on its own) before USDLoader builds it.
// USDLoader unzips the package with no limit on what an entry inflates to, keys parsed data by the
// names the file gives, and composes a referenced layer afresh for every reference to it, with no
// guard against a layer that references itself. This check reads the package the way fflate does,
// parses each layer with the loader's own parser, and counts what composing it would build, every
// layer multiplied by how often references reach it.
import { USDAParser } from 'three/examples/jsm/loaders/usd/USDAParser.js'
import { bytesSource } from './byte-sources.ts'
import { BUDGET, type BudgetExcess } from './gltf-budget.ts'
import { decodableUnmeasured, imageSize } from './image-dimensions.ts'
import { RESERVED_NAMES } from './mesh-budget.ts'
import { startsWith, USDC_MAGIC } from './model-format.ts'

/** What a passing file tells the parse: the unit its root layer states, and the images and layers it names outside itself. */
export type UsdFacts = { metersPerUnit: number | null; externalFiles: string[]; externalLayers: string[] }
export type UsdProblem = { corrupt: string } | { excess: BudgetExcess } | { binary: true } | { compressed: true }
export type UsdVerdict = { facts: UsdFacts; problem: null } | { facts: null; problem: UsdProblem }

export const USD_LIMITS = { entries: 4096 } as const
// Bytes the composer holds per number it builds: a JavaScript array slot, then the typed array.
const BUILD_BYTES_PER_NUMBER = 12
const MIPMAPPED = 4 / 3
const LAYER_EXTENSIONS = new Set(['usd', 'usda', 'usdc'])
// What USDLoader keeps from a package as images; it ignores every other file in it.
const IMAGE_EXTENSIONS = new Set(['png', 'jpg', 'jpeg', 'avif'])
const ASSET_PATH = /@([^@]+)@/g
const RESERVED_WORD = /(?:^|[^\w])(__proto__|constructor|prototype)(?![\w])/

type Layer = {
  base: string
  metersPerUnit: number | null
  numbers: number
  drawn: number
  prims: number
  references: string[]
  assets: string[]
}
type Entry = { name: string; bytes: Uint8Array }

class Refused extends Error {
  readonly problem: UsdProblem
  constructor(problem: UsdProblem) {
    super('refused')
    this.problem = problem
  }
}

const fail = (reason: string): never => {
  throw new Refused({ corrupt: reason })
}
const over = (excess: BudgetExcess): never => {
  throw new Refused({ excess })
}

const u16 = (bytes: Uint8Array, at: number): number => bytes[at] | (bytes[at + 1] << 8)
const u32 = (bytes: Uint8Array, at: number): number => (u16(bytes, at) | (u16(bytes, at + 2) << 16)) >>> 0

/** fflate's own decoding of an entry name: UTF-8 when the entry says so, else one character per byte. */
function entryName(bytes: Uint8Array, utf8: boolean): string {
  if (utf8) return new TextDecoder().decode(bytes)
  let name = ''
  for (const byte of bytes) name += String.fromCharCode(byte)
  return name
}

/** The lowercase extension of a name, as USDLoader reads it: none when the last dot is in a folder name. */
function extensionOf(name: string): string {
  const dot = name.lastIndexOf('.')
  return dot < 0 || name.lastIndexOf('/') > dot ? '' : name.slice(dot + 1).toLowerCase()
}

export const isUsdz = (bytes: Uint8Array): boolean => bytes[0] === 0x50 && bytes[1] === 0x4b

/**
 * Lists the entries of a USDZ package the way fflate's unzipSync finds them, refusing anything it
 * would inflate, any ZIP64 or encrypted entry, and any entry whose data runs past the file.
 */
export function readUsdzEntries(bytes: Uint8Array): Entry[] {
  let end = bytes.length - 22
  for (; end < 0 || u32(bytes, end) !== 0x06054b50; end--) {
    if (end <= 0 || bytes.length - end > 65558) fail('it has no ZIP directory')
  }
  const count = u16(bytes, end + 8)
  let at = u32(bytes, end + 16)
  if (count === 0xffff || at === 0xffffffff) fail('it is a ZIP64 package, which USDZ does not use')
  if (count > USD_LIMITS.entries) fail(`it holds ${count} files, more than the ${USD_LIMITS.entries} the viewer reads`)
  const entries: Entry[] = []
  const names = new Set<string>()
  // Why summed: entries may share bytes, and fflate copies each one out.
  let total = 0
  for (let index = 0; index < count; index++) {
    if (at + 46 > bytes.length || u32(bytes, at) !== 0x02014b50) fail('its ZIP directory is damaged')
    const flags = u16(bytes, at + 8)
    const method = u16(bytes, at + 10)
    const stored = u32(bytes, at + 20)
    const size = u32(bytes, at + 24)
    const nameLength = u16(bytes, at + 28)
    const local = u32(bytes, at + 42)
    if (at + 46 + nameLength > bytes.length) fail('its ZIP directory is damaged')
    const name = entryName(bytes.subarray(at + 46, at + 46 + nameLength), (flags & 2048) !== 0)
    at += 46 + nameLength + u16(bytes, at + 30) + u16(bytes, at + 32)
    if (method !== 0) throw new Refused({ compressed: true })
    if (flags & 1) fail(`${name} is encrypted`)
    if (stored === 0xffffffff || size === 0xffffffff) fail('it is a ZIP64 package, which USDZ does not use')
    if (stored !== size) fail(`${name} gives two different sizes`)
    if (RESERVED_NAMES.has(name)) fail(`a file is named ${name}`)
    if (names.has(name)) fail(`it holds ${name} twice`)
    names.add(name)
    if (local + 30 > bytes.length) fail(`${name} starts past the end of the file`)
    const start = local + 30 + u16(bytes, local + 26) + u16(bytes, local + 28)
    if (start + size > bytes.length) fail(`${name} runs past the end of the file`)
    total += size
    if (total > bytes.length) fail('its files overlap')
    entries.push({ name, bytes: bytes.subarray(start, start + size) })
  }
  return entries
}

/** Numbers in a parsed field value, counted without recursing past what a USD value nests. */
function countNumbers(value: unknown, depth = 0): number {
  if (typeof value === 'number') return 1
  if (depth > 8 || value === null || typeof value !== 'object') return 0
  let total = 0
  for (const item of Array.isArray(value) ? value : Object.values(value)) total += countNumbers(item, depth + 1)
  return total
}

/** Every string in a parsed field value, for the asset paths a layer names. */
function strings(value: unknown, found: string[], depth = 0): void {
  if (typeof value === 'string') found.push(value)
  else if (depth <= 8 && value !== null && typeof value === 'object') {
    for (const item of Array.isArray(value) ? value : Object.values(value)) strings(item, found, depth + 1)
  }
}

/** The asset path in "@path@" form, resolved the way USDComposer does: "./" dropped, then the base prepended. */
export function resolveAssetPath(path: string, base: string): string {
  const clean = path.startsWith('./') ? path.slice(2) : path
  if (!base) return clean
  if (/^(https?:)?\/\//i.test(clean) || /^data:.*,.*$/i.test(clean) || /^blob:.*$/i.test(clean)) return clean
  return (base.endsWith('/') ? base : `${base}/`) + clean
}

/**
 * What an asset path finds in the package, looked up as USDComposer looks up a texture: resolved
 * against the layer, then as written, then any file whose name ends with its base name. Returns the
 * image's decoded bytes (the largest of several matches), 'layer' for a USD layer, or null.
 */
function packagedAsset(path: string, base: string, layers: Map<string, Layer>, images: Map<string, number>): number | 'layer' | null {
  const exact = [resolveAssetPath(path, base), path].find((key) => images.has(key) || layers.has(key))
  if (exact !== undefined) return images.get(exact) ?? 'layer'
  const baseName = path.split('/').pop() ?? path
  let largest: number | null = null
  for (const [key, bytes] of images) if (key.endsWith(baseName)) largest = Math.max(largest ?? 0, bytes)
  if (largest !== null) return largest
  for (const key of layers.keys()) if (key.endsWith(baseName)) return 'layer'
  return null
}

function readLayer(name: string, text: string): Layer {
  const reserved = RESERVED_WORD.exec(text)
  if (reserved) fail(`it uses the name ${reserved[1]}`)
  let specsByPath: Record<string, { specType?: number; fields?: Record<string, unknown> }>
  try {
    specsByPath = new USDAParser().parseData(text).specsByPath
  } catch {
    return fail(`${name || 'the layer'} cannot be read as USD`)
  }
  const slash = name.lastIndexOf('/')
  const unit = specsByPath['/']?.fields?.metersPerUnit
  // Why refused: USDComposer scales by whatever a layer states, so zero or NaN would collapse the model.
  if (unit !== undefined && !(typeof unit === 'number' && Number.isFinite(unit) && unit > 0)) {
    fail(`${name || 'the layer'} states a metersPerUnit that is not a positive number`)
  }
  const layer: Layer = {
    base: slash >= 0 ? name.slice(0, slash) : '',
    metersPerUnit: typeof unit === 'number' ? unit : null,
    numbers: 0,
    drawn: 0,
    prims: 0,
    references: [],
    assets: []
  }
  for (const [path, spec] of Object.entries(specsByPath)) {
    const fields = spec.fields ?? {}
    layer.prims++
    layer.numbers += countNumbers(fields)
    if (path.endsWith('.faceVertexCounts') && Array.isArray(fields.default)) {
      for (const corners of fields.default) if (typeof corners === 'number' && corners > 2) layer.drawn += (corners - 2) * 3
    }
    const arcs: string[] = []
    strings(fields.references, arcs)
    strings(fields.payload, arcs)
    for (const arc of arcs) for (const match of arc.matchAll(ASSET_PATH)) layer.references.push(match[1])
    // Why both: the parser stores asset values without their @ marks, and USDComposer loads a
    // texture from any inputs:file attribute, whatever type it declares.
    if (fields.typeName === 'asset' || fields.typeName === 'asset[]' || path.endsWith('.inputs:file')) {
      const values: string[] = []
      strings(fields.default, values)
      strings(fields.timeSamples, values)
      for (const value of values) layer.assets.push(value.replace(/^@/, '').replace(/@$/, ''))
    }
  }
  return layer
}

function layerText(entry: Entry): string {
  if (startsWith(entry.bytes, USDC_MAGIC)) throw new Refused({ binary: true })
  return new TextDecoder().decode(entry.bytes)
}

/** Times each layer is composed: the root once, and each reference composes its whole layer again. */
function compositions(layers: Map<string, Layer>, root: string): Map<string, number> {
  const order: string[] = []
  const state = new Map<string, 'open' | 'done'>()
  const visit = (name: string, depth: number): void => {
    if (state.get(name) === 'done') return
    if (state.get(name) === 'open') fail(`its layers reference each other in a loop through ${name}`)
    if (depth > USD_LIMITS.entries) fail('its layers reference each other too deeply')
    state.set(name, 'open')
    const layer = layers.get(name)
    for (const path of layer?.references ?? []) {
      const target = resolveAssetPath(path, layer?.base ?? '')
      if (layers.has(target)) visit(target, depth + 1)
    }
    state.set(name, 'done')
    order.push(name)
  }
  visit(root, 0)
  const times = new Map<string, number>([[root, 1]])
  for (const name of order.reverse()) {
    const layer = layers.get(name)
    const composed = times.get(name) ?? 0
    for (const path of layer?.references ?? []) {
      const target = resolveAssetPath(path, layer?.base ?? '')
      if (!layers.has(target)) continue
      // Why capped: the totals only need to pass the budget, and doubles stay exact far below this.
      times.set(target, Math.min((times.get(target) ?? 0) + composed, Number.MAX_SAFE_INTEGER))
    }
  }
  return times
}

export function checkUsd(data: ArrayBuffer | string): UsdVerdict {
  try {
    return { facts: inspect(data), problem: null }
  } catch (error) {
    if (error instanceof Refused) return { facts: null, problem: error.problem }
    if (error instanceof RangeError) return { facts: null, problem: { corrupt: 'it nests too deeply' } }
    throw error
  }
}

function inspect(data: ArrayBuffer | string): UsdFacts {
  const started = Date.now()
  const bytes = typeof data === 'string' ? null : new Uint8Array(data)
  const entries = bytes && isUsdz(bytes) ? readUsdzEntries(bytes) : null
  const layers = new Map<string, Layer>()
  const images = new Map<string, number>()
  let root = ''
  if (entries) {
    if (entries.length === 0 || !LAYER_EXTENSIONS.has(extensionOf(entries[0].name))) fail('its first file is not a USD layer')
    root = entries[0].name
    let imageCount = 0
    for (const entry of entries) {
      const extension = extensionOf(entry.name)
      if (LAYER_EXTENSIONS.has(extension)) layers.set(entry.name, readLayer(entry.name, layerText(entry)))
      else if (IMAGE_EXTENSIONS.has(extension)) {
        if (++imageCount > BUDGET.images) over({ kind: 'images', value: imageCount, limit: BUDGET.images })
        const size = imageSize(bytesSource(entry.bytes))
        if (!size) {
          if (decodableUnmeasured(entry.bytes)) over({ kind: 'unreadableImage', index: imageCount - 1 })
          // TGA, TIFF and other formats the browser cannot decode are in the package, but never show.
          images.set(entry.name, 0)
          continue
        }
        const side = Math.max(size.width, size.height)
        if (side > BUDGET.imageSide) over({ kind: 'imageSide', value: side, limit: BUDGET.imageSide, ...size })
        images.set(entry.name, size.width * size.height * 4 * MIPMAPPED)
      }
    }
  } else {
    const text = typeof data === 'string' ? data : layerText({ name: '', bytes: new Uint8Array(data) })
    layers.set('', readLayer('', text))
  }
  if (Date.now() - started > BUDGET.checkMilliseconds) over({ kind: 'tooComplex' })

  const times = compositions(layers, root)
  let numbers = 0
  let drawn = 0
  let nodes = 0
  let imageBytes = 0
  const externalFiles = new Set<string>()
  const externalLayers = new Set<string>()
  const fileName = (path: string): string => path.split(/[\\/]/).at(-1) ?? path
  for (const [name, layer] of layers) {
    const composed = times.get(name) ?? 0
    numbers += layer.numbers * composed
    drawn += layer.drawn * composed
    nodes += layer.prims * composed
    if (composed === 0) continue
    for (const path of layer.references) if (!layers.has(resolveAssetPath(path, layer.base))) externalLayers.add(fileName(path))
    for (const path of layer.assets) {
      const found = packagedAsset(path, layer.base, layers, images)
      if (found === 'layer') continue
      if (found !== null) {
        imageBytes += found * composed
        continue
      }
      // Why refused: USDComposer hands such a path straight to an Image, past the LoadingManager
      // that keeps every other loader inside the package.
      if (layer.base) fail(`${path} is not in the package`)
      externalFiles.add(fileName(path))
    }
  }
  const geometry = numbers * BUILD_BYTES_PER_NUMBER
  if (geometry > BUDGET.geometryBytes) over({ kind: 'geometryBytes', value: geometry, limit: BUDGET.geometryBytes })
  if (drawn > BUDGET.drawnVertices) over({ kind: 'drawnVertices', value: drawn, limit: BUDGET.drawnVertices })
  if (nodes > BUDGET.nodes) over({ kind: 'nodes', value: nodes, limit: BUDGET.nodes })
  if (imageBytes > BUDGET.gpuBytes) over({ kind: 'gpuBytes', value: imageBytes, limit: BUDGET.gpuBytes })
  if (geometry + imageBytes > BUDGET.totalBytes) over({ kind: 'totalBytes', value: geometry + imageBytes, limit: BUDGET.totalBytes })

  return { metersPerUnit: layers.get(root)?.metersPerUnit ?? null, externalFiles: [...externalFiles], externalLayers: [...externalLayers] }
}
