// Worker entry: build.mjs bundles it into a string the page starts as a blob worker (model-check.ts).
import { checkModel } from './model-refusal.ts'

self.onmessage = (event: MessageEvent<unknown>) => {
  try {
    if (typeof event.data !== 'string' && !(event.data instanceof ArrayBuffer)) throw new TypeError('not model data')
    self.postMessage(checkModel(event.data))
  } catch (error) {
    self.postMessage({ failed: String(error) })
  }
}
