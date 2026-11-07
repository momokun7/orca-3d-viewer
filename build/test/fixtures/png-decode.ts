// Decodes the PNG screenshots Chromium takes (8-bit RGB or RGBA, not interlaced) to read pixels.
import { inflateSync } from 'node:zlib'

export type Pixels = { width: number; height: number; channels: number; data: Uint8Array }

function paeth(a: number, b: number, c: number): number {
  const p = a + b - c
  const pa = Math.abs(p - a)
  const pb = Math.abs(p - b)
  const pc = Math.abs(p - c)
  return pa <= pb && pa <= pc ? a : pb <= pc ? b : c
}

export function decodePng(png: Uint8Array): Pixels {
  const buffer = Buffer.from(png)
  const width = buffer.readUInt32BE(16)
  const height = buffer.readUInt32BE(20)
  const colorType = buffer[25]
  if (buffer[24] !== 8 || buffer[28] !== 0 || (colorType !== 2 && colorType !== 6)) {
    throw new Error('only 8-bit, non-interlaced RGB or RGBA PNGs are supported')
  }
  const channels = colorType === 6 ? 4 : 3
  const idat: Buffer[] = []
  for (let at = 8; at < buffer.length; ) {
    const length = buffer.readUInt32BE(at)
    if (buffer.toString('ascii', at + 4, at + 8) === 'IDAT') idat.push(buffer.subarray(at + 8, at + 8 + length))
    at += 12 + length
  }
  const raw = inflateSync(Buffer.concat(idat))
  const stride = width * channels
  const data = new Uint8Array(height * stride)
  for (let y = 0; y < height; y++) {
    const filter = raw[y * (stride + 1)]
    const line = raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1))
    for (let x = 0; x < stride; x++) {
      const left = x >= channels ? data[y * stride + x - channels] : 0
      const up = y > 0 ? data[(y - 1) * stride + x] : 0
      const upLeft = x >= channels && y > 0 ? data[(y - 1) * stride + x - channels] : 0
      const predictor = [0, left, up, (left + up) >> 1, paeth(left, up, upLeft)][filter]
      data[y * stride + x] = (line[x] + predictor) & 0xff
    }
  }
  return { width, height, channels, data }
}

export function pixelAt({ width, channels, data }: Pixels, x: number, y: number): number[] {
  const at = (y * width + x) * channels
  return [...data.subarray(at, at + channels)]
}
