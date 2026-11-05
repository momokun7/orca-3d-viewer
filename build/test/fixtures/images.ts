// Image headers that claim a size, for the budget tests; the bodies after them are not valid images.
import { deflateSync } from 'node:zlib'

const crcTable = Array.from({ length: 256 }, (_, n) => {
  let c = n
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
  return c >>> 0
})

function crc32(bytes: Uint8Array): number {
  let crc = 0xffffffff
  for (const byte of bytes) crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8)
  return (crc ^ 0xffffffff) >>> 0
}

function pngChunk(type: string, data: Uint8Array): Buffer {
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data])
  const out = Buffer.alloc(8 + data.length + 4)
  out.writeUInt32BE(data.length, 0)
  body.copy(out, 4)
  out.writeUInt32BE(crc32(body), 8 + data.length)
  return out
}

export function pngHeader(width: number, height: number): Uint8Array {
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(width, 0)
  ihdr.writeUInt32BE(height, 4)
  ihdr.set([8, 2, 0, 0, 0], 8)
  return Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), pngChunk('IHDR', ihdr)])
}

/** A complete, decodable PNG of one colour. */
export function solidPng(width: number, height: number, [r, g, b]: [number, number, number]): Uint8Array {
  const row = Buffer.alloc(1 + width * 3)
  for (let x = 0; x < width; x++) row.set([r, g, b], 1 + x * 3)
  const raw = Buffer.concat(Array.from({ length: height }, () => row))
  return Buffer.concat([pngHeader(width, height), pngChunk('IDAT', deflateSync(raw)), pngChunk('IEND', new Uint8Array())])
}

export function jpegHeader(width: number, height: number): Uint8Array {
  const app0 = [0xff, 0xe0, 0x00, 0x10, ...Buffer.from('JFIF\0'), 1, 1, 0, 0, 1, 0, 1, 0, 0]
  const sof = [0xff, 0xc0, 0x00, 0x11, 8, height >> 8, height & 0xff, width >> 8, width & 0xff, 3, 1, 0x11, 0, 2, 0x11, 1, 3, 0x11, 1]
  return Uint8Array.from([0xff, 0xd8, ...app0, ...sof, 0xff, 0xd9])
}

export function webpHeader(kind: 'VP8X' | 'VP8L', width: number, height: number): Uint8Array {
  const out = Buffer.alloc(40)
  out.write('RIFF', 0, 'ascii')
  out.writeUInt32LE(32, 4)
  out.write('WEBP', 8, 'ascii')
  out.write(kind, 12, 'ascii')
  if (kind === 'VP8X') {
    out.writeUIntLE(width - 1, 24, 3)
    out.writeUIntLE(height - 1, 27, 3)
  } else {
    const bits = (width - 1) | ((height - 1) << 14)
    out[20] = 0x2f
    out.writeUInt32LE(bits >>> 0, 21)
  }
  return out
}

export function ktx2Header(width: number, height: number): Uint8Array {
  const out = Buffer.alloc(48)
  out.set([0xab, 0x4b, 0x54, 0x58, 0x20, 0x32, 0x30, 0xbb, 0x0d, 0x0a, 0x1a, 0x0a])
  out.writeUInt32LE(width, 20)
  out.writeUInt32LE(height, 24)
  return out
}

export function gifHeader(width: number, height: number): Uint8Array {
  const out = Buffer.alloc(32)
  out.write('GIF89a', 0, 'ascii')
  out.writeUInt16LE(width, 6)
  out.writeUInt16LE(height, 8)
  return out
}
