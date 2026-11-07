import { type BufferGeometry } from 'three'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import { spendDecodeAllowance } from './decode-allowance.ts'

// Why relative to this chunk: build.mjs copies the decoder to editor/draco/, beside editor/assets/.
const DRACO_DECODER_PATH = new URL('../draco/', import.meta.url).href

type DecodedGeometry = {
  index?: { array: ArrayBufferView }
  attributes: { array: ArrayBufferView }[]
}

/** DRACOLoader that counts what each decode returns against the parse's allowance before using it. */
class AllowanceDracoLoader extends DRACOLoader {
  _createGeometry(geometryData: DecodedGeometry): BufferGeometry {
    const bytes =
      (geometryData.index?.array.byteLength ?? 0) +
      geometryData.attributes.reduce((sum, attribute) => sum + attribute.array.byteLength, 0)
    spendDecodeAllowance(bytes)
    // SAFETY: _createGeometry is DRACOLoader's own (untyped) method; this override only adds the check.
    return (DRACOLoader.prototype as unknown as { _createGeometry: (data: DecodedGeometry) => BufferGeometry })._createGeometry.call(
      this,
      geometryData
    )
  }
}

export function createDracoLoader(): DRACOLoader {
  const loader = new AllowanceDracoLoader()
  loader.setDecoderPath(DRACO_DECODER_PATH)
  // Why one worker: each holds its own decoder heap, which never shrinks.
  loader.setWorkerLimit(1)
  return loader
}
