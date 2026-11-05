// Reads an image's pixel size from its header, before anything decodes it, so a small file that
// decodes to gigabytes (a decompression bomb) can be refused up front. Only the formats glTF allows
// are read (PNG and JPEG, WebP, AVIF and KTX2 through extensions); anything else has no size, and the
// caller refuses it rather than let the browser decode an image of unknown size.
import type { ByteSource } from './byte-sources.ts'

export type ImageSize = { width: number; height: number }

const uint16be = (bytes: Uint8Array, at: number): number => (bytes[at] << 8) | bytes[at + 1]
const uint32be = (bytes: Uint8Array, at: number): number =>
  ((bytes[at] << 24) | (bytes[at + 1] << 16) | (bytes[at + 2] << 8) | bytes[at + 3]) >>> 0
const uint32le = (bytes: Uint8Array, at: number): number =>
  (bytes[at] | (bytes[at + 1] << 8) | (bytes[at + 2] << 16) | (bytes[at + 3] << 24)) >>> 0
const ascii = (bytes: Uint8Array, at: number, length: number): string =>
  String.fromCharCode(...bytes.subarray(at, at + length))

const KTX2_IDENTIFIER = [0xab, 0x4b, 0x54, 0x58, 0x20, 0x32, 0x30, 0xbb, 0x0d, 0x0a, 0x1a, 0x0a]
// JPEG start-of-frame markers, the ones that carry the image size.
const JPEG_SOF = new Set([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf])
const JPEG_START_OF_SCAN = 0xda
const MAX_JPEG_SEGMENTS = 10_000
// Bytes read at a time while skipping what libjpeg skips between segments.
const SCAN_CHUNK = 4096
const MAX_JPEG_GAP = 1024 * 1024
const MAX_BOXES = 10_000

/** The offset of the next 0xFF at or after `at`, as libjpeg skips stray bytes; -1 past the gap limit. */
function nextFF(source: ByteSource, at: number): number {
  for (let start = at; start < source.length && start - at <= MAX_JPEG_GAP; start += SCAN_CHUNK) {
    const chunk = source.read(start, SCAN_CHUNK)
    const found = chunk.indexOf(0xff)
    if (found !== -1) return start + found
  }
  return -1
}

function jpegSize(source: ByteSource): ImageSize | null {
  let at = 2
  for (let segment = 0; segment < MAX_JPEG_SEGMENTS; segment++) {
    at = nextFF(source, at)
    if (at === -1) return null
    // Any run of 0xFF before a marker is fill.
    while (at < source.length && source.read(at, 1)[0] === 0xff) at++
    if (at >= source.length) return null
    const marker = source.read(at, 1)[0]
    at++
    if (marker === 0x00 || marker === 0x01 || marker === 0xd8 || (marker >= 0xd0 && marker <= 0xd7)) continue
    if (marker === JPEG_START_OF_SCAN || marker === 0xd9) return null
    const head = source.read(at, 7)
    if (head.length < 2) return null
    if (JPEG_SOF.has(marker)) {
      return head.length === 7 ? { height: uint16be(head, 3), width: uint16be(head, 5) } : null
    }
    at += uint16be(head, 0)
  }
  return null
}

function webpSize(head: Uint8Array): ImageSize | null {
  const chunk = ascii(head, 12, 4)
  if (chunk === 'VP8 ' && head.length >= 30) {
    return { width: (head[26] | (head[27] << 8)) & 0x3fff, height: (head[28] | (head[29] << 8)) & 0x3fff }
  }
  if (chunk === 'VP8L' && head.length >= 25) {
    return {
      width: 1 + (((head[22] & 0x3f) << 8) | head[21]),
      height: 1 + (((head[24] & 0x0f) << 10) | (head[23] << 2) | ((head[22] & 0xc0) >> 6))
    }
  }
  if (chunk === 'VP8X' && head.length >= 30) {
    return {
      width: 1 + (head[24] | (head[25] << 8) | (head[26] << 16)),
      height: 1 + (head[27] | (head[28] << 8) | (head[29] << 16))
    }
  }
  return null
}

type Box = { type: string; start: number; end: number }

/** The ISO-BMFF boxes between `start` and `end`. */
function boxes(source: ByteSource, start: number, end: number): Box[] {
  const found: Box[] = []
  for (let at = start; at + 8 <= end && found.length < MAX_BOXES; ) {
    const head = source.read(at, 16)
    let size = uint32be(head, 0)
    let header = 8
    if (size === 1) {
      // Why only the low word: a 64-bit size past 4 GiB cannot fit a 64 MiB file anyway.
      size = uint32be(head, 12) + uint32be(head, 8) * 2 ** 32
      header = 16
    } else if (size === 0) {
      size = end - at
    }
    if (size < header || at + size > end) break
    found.push({ type: ascii(head, 4, 4), start: at + header, end: at + size })
    at += size
  }
  return found
}

function avifSize(source: ByteSource): ImageSize | null {
  const child = (parent: Box | undefined, type: string, skip = 0): Box | undefined =>
    parent && boxes(source, parent.start + skip, parent.end).find((box) => box.type === type)
  const meta = boxes(source, 0, source.length).find((box) => box.type === 'meta')
  // Why skip 4: meta is a full box, with version and flags before its children.
  const ipco = child(child(meta, 'iprp', 4), 'ipco')
  if (!ipco) return null
  let largest: ImageSize | null = null
  // Why the largest: a grid image lists a size per tile and one for the whole.
  for (const box of boxes(source, ipco.start, ipco.end).filter((entry) => entry.type === 'ispe')) {
    const body = source.read(box.start, 12)
    if (body.length < 12) continue
    const size = { width: uint32be(body, 4), height: uint32be(body, 8) }
    if (!largest || size.width * size.height > largest.width * largest.height) largest = size
  }
  return largest
}

export type ImageFormat = 'png' | 'jpeg' | 'webp' | 'avif' | 'ktx2'

export function imageFormat(head: Uint8Array): ImageFormat | null {
  if (head.length < 16) return null
  if (head[0] === 0x89 && ascii(head, 1, 3) === 'PNG') return 'png'
  if (head[0] === 0xff && head[1] === 0xd8) return 'jpeg'
  if (ascii(head, 0, 4) === 'RIFF' && ascii(head, 8, 4) === 'WEBP') return 'webp'
  if (ascii(head, 4, 4) === 'ftyp') return 'avif'
  if (KTX2_IDENTIFIER.every((byte, index) => head[index] === byte)) return 'ktx2'
  return null
}

/** The pixel size an image will decode to, or null when it is not a format and header this reader knows. */
export function imageSize(source: ByteSource): ImageSize | null {
  const head = source.read(0, 32)
  switch (imageFormat(head)) {
    case 'png':
      return head.length >= 24 && ascii(head, 12, 4) === 'IHDR' ? { width: uint32be(head, 16), height: uint32be(head, 20) } : null
    case 'jpeg':
      return jpegSize(source)
    case 'webp':
      return webpSize(head)
    case 'avif':
      return avifSize(source)
    case 'ktx2':
      return head.length >= 28 ? { width: uint32le(head, 20), height: Math.max(1, uint32le(head, 24)) } : null
    default:
      return null
  }
}
