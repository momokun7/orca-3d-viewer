import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'

// Why relative to this chunk: build.mjs copies the decoder to editor/draco/, beside editor/assets/.
const DRACO_DECODER_PATH = new URL('../draco/', import.meta.url).href

export function createDracoLoader(): DRACOLoader {
  const loader = new DRACOLoader()
  loader.setDecoderPath(DRACO_DECODER_PATH)
  return loader
}
