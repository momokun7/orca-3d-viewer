import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'

// Why relative to this chunk: build.mjs copies the decoder to editor/draco/, beside editor/assets/.
const DRACO_DECODER_PATH = new URL('../draco/', import.meta.url).href

export function createDracoLoader(): DRACOLoader {
  const loader = new DRACOLoader()
  loader.setDecoderPath(DRACO_DECODER_PATH)
  // Why one worker: each holds its own decoder heap, which never shrinks.
  loader.setWorkerLimit(1)
  return loader
}
