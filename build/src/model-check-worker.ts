// Worker entry: build.mjs bundles it into a string the page starts as a blob worker (model-check.ts).
import type { ModelFormat } from './model-format.ts'
import { checkModel } from './model-refusal.ts'

const FORMATS = new Set<unknown>(['gltf', 'stl', 'ply', 'obj', 'fbx', 'usd'] satisfies ModelFormat[])

self.onmessage = (event: MessageEvent<{ format?: unknown; data?: unknown } | null>) => {
  try {
    const format = event.data?.format
    const data = event.data?.data
    if (!FORMATS.has(format) || (typeof data !== 'string' && !(data instanceof ArrayBuffer))) throw new TypeError('not model data')
    // SAFETY: FORMATS holds exactly the ModelFormat values, so membership narrows it.
    self.postMessage(checkModel(format as ModelFormat, data))
  } catch (error) {
    self.postMessage({ failed: String(error) })
  }
}
