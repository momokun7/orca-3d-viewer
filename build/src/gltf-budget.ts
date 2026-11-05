// Refuses a model before three.js allocates for it when its JSON declares more than the viewer can
// hold: a few hundred bytes of glTF can declare gigabytes of vertex data (a sparse accessor with no
// buffer is zero-filled), hundreds of thousands of draw calls, or images that decode to gigabytes.
import { type GltfDocument, isDataUri, isRecord } from './gltf-document-inspection.ts'
import { base64Source, type ByteSource, bytesSource, imageSize } from './image-dimensions.ts'

export const BUDGET = {
  accessorBytes: 512 * 1024 * 1024,
  nodes: 100_000,
  drawCalls: 50_000,
  imageSide: 16_384,
  imagePixels: 128 * 1024 * 1024
} as const

export type BudgetExcess =
  | { kind: 'accessorBytes' | 'nodes' | 'drawCalls' | 'imagePixels'; value: number; limit: number }
  | { kind: 'imageSide'; value: number; limit: number; width: number; height: number }
  | { kind: 'accessorOutOfRange'; index: number }

const COMPONENT_BYTES: Record<number, number> = { 5120: 1, 5121: 1, 5122: 2, 5123: 2, 5125: 4, 5126: 4 }
const TYPE_COMPONENTS: Record<string, number> = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4, MAT2: 4, MAT3: 9, MAT4: 16 }

function list(document: GltfDocument, key: string): Record<string, unknown>[] {
  const value = document[key]
  return Array.isArray(value) ? value.map((entry) => (isRecord(entry) ? entry : {})) : []
}

const count = (value: unknown): number => (typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : 0)

function accessorExcess(document: GltfDocument): BudgetExcess | null {
  const bufferViews = list(document, 'bufferViews')
  let total = 0
  for (const [index, accessor] of list(document, 'accessors').entries()) {
    const elementBytes =
      (COMPONENT_BYTES[accessor.componentType as number] ?? 4) * (TYPE_COMPONENTS[accessor.type as string] ?? 16)
    const elements = count(accessor.count)
    total += elements * elementBytes
    const view = typeof accessor.bufferView === 'number' ? bufferViews[accessor.bufferView] : undefined
    if (view && elements > 0) {
      const stride = count(view.byteStride) || elementBytes
      const end = count(accessor.byteOffset) + (elements - 1) * stride + elementBytes
      if (end > count(view.byteLength)) return { kind: 'accessorOutOfRange', index }
    }
  }
  return total > BUDGET.accessorBytes ? { kind: 'accessorBytes', value: total, limit: BUDGET.accessorBytes } : null
}

function drawCallExcess(document: GltfDocument): BudgetExcess | null {
  const nodes = list(document, 'nodes')
  if (nodes.length > BUDGET.nodes) return { kind: 'nodes', value: nodes.length, limit: BUDGET.nodes }
  const primitives = list(document, 'meshes').map((mesh) => (Array.isArray(mesh.primitives) ? mesh.primitives.length : 0))
  let drawCalls = 0
  for (const node of nodes) {
    // Why one per primitive: GPU instancing draws all instances of a node in a single call.
    if (typeof node.mesh === 'number') drawCalls += primitives[node.mesh] ?? 0
  }
  return drawCalls > BUDGET.drawCalls ? { kind: 'drawCalls', value: drawCalls, limit: BUDGET.drawCalls } : null
}

function imageSource(image: Record<string, unknown>, document: GltfDocument, bin: Uint8Array | null): ByteSource | null {
  if (typeof image.uri === 'string' && isDataUri(image.uri)) {
    const comma = image.uri.indexOf(',')
    return /;base64$/i.test(image.uri.slice(0, comma)) ? base64Source(image.uri.slice(comma + 1)) : null
  }
  const view = typeof image.bufferView === 'number' ? list(document, 'bufferViews')[image.bufferView] : undefined
  const buffer = view && typeof view.buffer === 'number' ? list(document, 'buffers')[view.buffer] : undefined
  if (!view || !buffer) return null
  const offset = count(view.byteOffset)
  const length = count(view.byteLength)
  if (typeof buffer.uri === 'string' && isDataUri(buffer.uri)) {
    const whole = imageSource({ uri: buffer.uri }, document, bin)
    return whole && { length, read: (at, size) => whole.read(offset + at, Math.min(size, length - at)) }
  }
  return bin && view.buffer === 0 && buffer.uri === undefined ? bytesSource(bin.subarray(offset, offset + length)) : null
}

function imageExcess(document: GltfDocument, bin: Uint8Array | null): BudgetExcess | null {
  let pixels = 0
  for (const image of list(document, 'images')) {
    const source = imageSource(image, document, bin)
    const size = source && imageSize(source)
    if (!size) continue
    if (size.width > BUDGET.imageSide || size.height > BUDGET.imageSide) {
      return { kind: 'imageSide', value: Math.max(size.width, size.height), limit: BUDGET.imageSide, ...size }
    }
    pixels += size.width * size.height
  }
  return pixels > BUDGET.imagePixels ? { kind: 'imagePixels', value: pixels, limit: BUDGET.imagePixels } : null
}

/** The first way the document exceeds the viewer's budget, or null when it fits. */
export function gltfBudgetExcess(document: GltfDocument, bin: Uint8Array | null): BudgetExcess | null {
  return accessorExcess(document) ?? drawCallExcess(document) ?? imageExcess(document, bin)
}
