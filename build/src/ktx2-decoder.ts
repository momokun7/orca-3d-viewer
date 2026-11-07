import { LoadingManager, type WebGLRenderer } from 'three'
import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader.js'

// Why relative to this chunk: build.mjs copies the Basis transcoder to editor/basis/, beside editor/assets/.
const TRANSCODER_PATH = new URL('../basis/', import.meta.url).href

/**
 * A KTX2 loader for `renderer`. KTX2Loader fetches image data through its own manager, not
 * GLTFLoader's, so it gets the same URL policy here, with the bundled transcoder as the only exception.
 */
export function createKtx2Loader(renderer: WebGLRenderer, resolveUrl: (url: string) => string): KTX2Loader {
  const manager = new LoadingManager()
  manager.setURLModifier((url) => (url.startsWith(TRANSCODER_PATH) ? url : resolveUrl(url)))
  const loader = new KTX2Loader(manager).setTranscoderPath(TRANSCODER_PATH).detectSupport(renderer)
  // Why one worker: each holds its own transcoder heap, which never shrinks.
  loader.setWorkerLimit(1)
  return loader
}
