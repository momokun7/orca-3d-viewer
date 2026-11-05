// Reads an image's pixel size from its header, before anything decodes it, so a small file that
// decodes to gigabytes (a decompression bomb) can be refused up front.

export type ImageSize = { width: number; height: number }

/** Random access to bytes that may still be base64 text (a data: URI), decoding only what is read. */
export type ByteSource = { length: number; read: (offset: number, length: number) => Uint8Array }

export function bytesSource(bytes: Uint8Array): ByteSource {
  return { length: bytes.length, read: (offset, length) => bytes.subarray(offset, offset + length) }
}

const BASE64_CHUNK_CHARS = 4

/** A ByteSource over base64 text; null when the text is not base64. */
export function base64Source(text: string): ByteSource | null {
  const clean = text.replace(/\s/g, '')
  if (!/^[A-Za-z0-9+/]*={0,2}$/.test(clean)) {
    return null
  }
  const padding = clean.endsWith('==') ? 2 : clean.endsWith('=') ? 1 : 0
  const length = Math.floor((clean.length * 3) / 4) - padding
  return {
    length,
    read: (offset, count) => {
      const start = Math.max(0, offset)
      const end = Math.min(length, start + count)
      if (end <= start) return new Uint8Array()
      const firstGroup = Math.floor(start / 3)
      const lastGroup = Math.ceil(end / 3)
      const slice = clean.slice(firstGroup * BASE64_CHUNK_CHARS, lastGroup * BASE64_CHUNK_CHARS)
      const binary = atob(slice)
      const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0))
      return bytes.subarray(start - firstGroup * 3, end - firstGroup * 3)
    }
  }
}

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
// How far into an AVIF to look for its 'ispe' (image spatial extent) box.
const AVIF_SCAN_BYTES = 64 * 1024
const MAX_JPEG_SEGMENTS = 10_000

function jpegSize(source: ByteSource): ImageSize | null {
  let at = 2
  for (let segment = 0; segment < MAX_JPEG_SEGMENTS && at + 4 <= source.length; segment++) {
    const head = source.read(at, 4)
    if (head[0] !== 0xff) return null
    const marker = head[1]
    if (marker === 0xff) {
      at += 1
      continue
    }
    if (marker === 0xd8 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) {
      at += 2
      continue
    }
    if (JPEG_SOF.has(marker)) {
      const frame = source.read(at + 5, 4)
      return frame.length === 4 ? { height: uint16be(frame, 0), width: uint16be(frame, 2) } : null
    }
    at += 2 + uint16be(head, 2)
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

function avifSize(source: ByteSource): ImageSize | null {
  const head = source.read(0, AVIF_SCAN_BYTES)
  let largest: ImageSize | null = null
  // Why the largest: a grid image lists a size per tile and one for the whole.
  for (let at = 4; at + 16 <= head.length; at++) {
    if (head[at] === 0x69 && ascii(head, at, 4) === 'ispe') {
      const size = { width: uint32be(head, at + 8), height: uint32be(head, at + 12) }
      if (!largest || size.width * size.height > largest.width * largest.height) largest = size
    }
  }
  return largest
}

/** The pixel size an image will decode to, or null when the header is not one this reader knows. */
export function imageSize(source: ByteSource): ImageSize | null {
  const head = source.read(0, 32)
  if (head.length < 24) return null
  if (head[0] === 0x89 && ascii(head, 1, 3) === 'PNG') {
    return { width: uint32be(head, 16), height: uint32be(head, 20) }
  }
  if (head[0] === 0xff && head[1] === 0xd8) {
    return jpegSize(source)
  }
  if (ascii(head, 0, 4) === 'RIFF' && ascii(head, 8, 4) === 'WEBP') {
    return webpSize(head)
  }
  if (ascii(head, 4, 4) === 'ftyp') {
    return avifSize(source)
  }
  if (KTX2_IDENTIFIER.every((byte, index) => head[index] === byte)) {
    return { width: uint32le(head, 20), height: Math.max(1, uint32le(head, 24)) }
  }
  if (ascii(head, 0, 4) === 'GIF8') {
    return { width: head[6] | (head[7] << 8), height: head[8] | (head[9] << 8) }
  }
  return null
}
