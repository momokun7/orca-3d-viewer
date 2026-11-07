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

/** A complete, uncompressed RGBA8 sRGB KTX2 texture of one colour. */
export async function solidKtx2(width: number, height: number, [r, g, b]: [number, number, number]): Promise<Uint8Array> {
  const ktx = await import('ktx-parse')
  const container = ktx.createDefaultContainer()
  container.vkFormat = ktx.VK_FORMAT_R8G8B8A8_SRGB
  container.typeSize = 1
  container.pixelWidth = width
  container.pixelHeight = height
  const pixels = new Uint8Array(width * height * 4)
  for (let at = 0; at < pixels.length; at += 4) pixels.set([r, g, b, 255], at)
  container.levels = [{ levelData: pixels, uncompressedByteLength: pixels.length }]
  const [dfd] = container.dataFormatDescriptor
  dfd.colorModel = ktx.KHR_DF_MODEL_RGBSDA
  dfd.colorPrimaries = ktx.KHR_DF_PRIMARIES_BT709
  dfd.transferFunction = ktx.KHR_DF_TRANSFER_SRGB
  dfd.texelBlockDimension = [0, 0, 0, 0]
  dfd.bytesPlane = [4, 0, 0, 0, 0, 0, 0, 0]
  dfd.samples = [ktx.KHR_DF_CHANNEL_RGBSDA_RED, ktx.KHR_DF_CHANNEL_RGBSDA_GREEN, ktx.KHR_DF_CHANNEL_RGBSDA_BLUE, ktx.KHR_DF_CHANNEL_RGBSDA_ALPHA].map(
    (channelType, index) => ({
      bitOffset: index * 8,
      bitLength: 7,
      channelType: channelType | (index === 3 ? 0x40 : 0),
      samplePosition: [0, 0, 0, 0],
      sampleLower: 0,
      sampleUpper: 255
    })
  )
  return ktx.write(container)
}

export function bmpHeader(width: number, height: number): Uint8Array {
  const out = Buffer.alloc(54)
  out.write('BM', 0, 'ascii')
  out.writeUInt32LE(40, 14)
  out.writeInt32LE(width, 18)
  out.writeInt32LE(height, 22)
  return out
}

function box(type: string, ...children: Uint8Array[]): Buffer {
  const body = Buffer.concat(children)
  const head = Buffer.alloc(8)
  head.writeUInt32BE(8 + body.length, 0)
  head.write(type, 4, 'ascii')
  return Buffer.concat([head, body])
}

/** An AVIF skeleton whose 'ispe' box claims a size, after `padding` bytes of media data. */
export function avifHeader(width: number, height: number, padding = 0): Uint8Array {
  const ispeBody = Buffer.alloc(12)
  ispeBody.writeUInt32BE(width, 4)
  ispeBody.writeUInt32BE(height, 8)
  const fullBox = Buffer.alloc(4)
  return Buffer.concat([
    box('ftyp', Buffer.from('avif\0\0\0\0avifmif1', 'ascii')),
    box('mdat', Buffer.alloc(padding)),
    box('meta', fullBox, box('hdlr', Buffer.alloc(24)), box('iprp', box('ipco', box('ispe', ispeBody))))
  ])
}
