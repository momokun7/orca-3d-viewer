// Reads how much a Draco bitstream will decode to from its header, before the decoder runs: the
// accessor counts a glTF declares are ignored by the decoder, and a few kilobytes of Draco can
// decode to hundreds of megabytes. Layout from Draco's decoder sources (header, optional metadata,
// then the connectivity header of the sequential or edgebreaker method, or a point count).
import type { ByteSource } from './byte-sources.ts'

export type DracoSize = {
  /** An upper bound on decoded points (vertices). */
  points: number
  /** Decoded triangles; 0 for a point cloud. */
  faces: number
}

const MAGIC = 'DRACO'
const METADATA_FLAG = 0x8000
const MESH = 1
const POINT_CLOUD = 0
const SEQUENTIAL = 0
const EDGEBREAKER = 1
const MAX_METADATA_DEPTH = 32
// The most bytes the header, metadata included, may take before the counts; past it the stream is refused.
const HEADER_WINDOW = 64 * 1024

class Reader {
  private at = 0
  private readonly bytes: Uint8Array
  constructor(source: ByteSource) {
    this.bytes = source.read(0, HEADER_WINDOW)
  }
  u8(): number {
    if (this.at >= this.bytes.length) throw new RangeError('Draco header ends early')
    return this.bytes[this.at++]
  }
  u16(): number {
    return this.u8() | (this.u8() << 8)
  }
  u32(): number {
    return (this.u8() | (this.u8() << 8) | (this.u8() << 16) | (this.u8() << 24)) >>> 0
  }
  i32(): number {
    return this.u32() | 0
  }
  varint(): number {
    let value = 0
    for (let shift = 0; shift < 53; shift += 7) {
      const byte = this.u8()
      value += (byte & 0x7f) * 2 ** shift
      if (!(byte & 0x80)) return value
    }
    throw new RangeError('Draco varint too long')
  }
  skip(count: number): void {
    this.at += count
    if (this.at > this.bytes.length) throw new RangeError('Draco header ends early')
  }
  remaining(): number {
    return this.bytes.length - this.at
  }
}

// As Draco's MetadataDecoder: an entry is a u8-length name and a varint-length value that must be
// non-empty and fit the rest of the stream; a sub-metadata is a u8-length name and a nested element.
function skipMetadataElement(reader: Reader, depth: number): void {
  if (depth > MAX_METADATA_DEPTH) throw new RangeError('Draco metadata nested too deep')
  const entries = reader.varint()
  if (entries > reader.remaining()) throw new RangeError('Draco metadata entry count exceeds the stream')
  for (let entry = 0; entry < entries; entry++) {
    reader.skip(reader.u8())
    const size = reader.varint()
    if (size === 0 || size > reader.remaining()) throw new RangeError('Draco metadata value size is invalid')
    reader.skip(size)
  }
  const children = reader.varint()
  if (children > reader.remaining()) throw new RangeError('Draco sub-metadata count exceeds the stream')
  for (let child = 0; child < children; child++) {
    reader.skip(reader.u8())
    skipMetadataElement(reader, depth + 1)
  }
}

/** The decoded size a Draco bitstream declares, or null when it is not one this reader understands. */
export function dracoSize(source: ByteSource): DracoSize | null {
  try {
    const reader = new Reader(source)
    const magic = String.fromCharCode(reader.u8(), reader.u8(), reader.u8(), reader.u8(), reader.u8())
    if (magic !== MAGIC) return null
    const major = reader.u8()
    const minor = reader.u8()
    const version = major * 256 + minor
    const encoderType = reader.u8()
    const method = reader.u8()
    const flags = reader.u16()
    if (flags & METADATA_FLAG) {
      const attributeMetadata = reader.varint()
      for (let index = 0; index < attributeMetadata; index++) {
        reader.varint()
        skipMetadataElement(reader, 0)
      }
      skipMetadataElement(reader, 0)
    }
    if (encoderType === POINT_CLOUD) {
      const points = reader.i32()
      return points >= 0 ? { points, faces: 0 } : null
    }
    if (encoderType !== MESH) return null
    const v2_0 = version >= 0x0200
    const v2_2 = version >= 0x0202
    if (method === SEQUENTIAL) {
      const faces = v2_2 ? reader.varint() : reader.u32()
      const points = v2_2 ? reader.varint() : reader.u32()
      return { points, faces }
    }
    if (method === EDGEBREAKER) {
      reader.u8() // traversal decoder type
      if (!v2_2) reader.u32() // new vertices, before 2.2
      const encodedVertices = v2_0 ? reader.varint() : reader.u32()
      const faces = v2_0 ? reader.varint() : reader.u32()
      // Why this bound: attribute seams split encoded vertices, but never past one point per face corner.
      return { points: Math.max(encodedVertices, faces * 3), faces }
    }
    return null
  } catch {
    return null
  }
}
