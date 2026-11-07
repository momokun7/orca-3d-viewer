// Random access to the bytes of a glTF's buffers and buffer views, wherever they live (the GLB BIN
// chunk, or a base64 or percent-encoded data: URI), decoding only what is read and each buffer once.
import { type GltfDocument, isDataUri, isRecord } from './gltf-document-inspection.ts'

export type ByteSource = { length: number; read: (offset: number, length: number) => Uint8Array }

export function bytesSource(bytes: Uint8Array): ByteSource {
  return {
    length: bytes.length,
    read: (offset, length) => bytes.subarray(Math.max(0, offset), Math.max(0, offset) + Math.max(0, length))
  }
}

const BASE64 = /^[A-Za-z0-9+/]*={0,2}$/

/** A ByteSource over base64 text that decodes only the groups each read covers; null when not base64. */
export function base64Source(text: string): ByteSource | null {
  const clean = /\s/.test(text) ? text.replace(/\s/g, '') : text
  if (clean.length % 4 === 1 || !BASE64.test(clean)) {
    return null
  }
  const padding = clean.endsWith('==') ? 2 : clean.endsWith('=') ? 1 : 0
  const length = Math.floor((clean.length * 3) / 4) - padding
  return {
    length,
    read: (offset, count) => {
      const start = Math.max(0, offset)
      const end = Math.min(length, start + Math.max(0, count))
      if (end <= start) return new Uint8Array()
      const firstGroup = Math.floor(start / 3)
      const slice = clean.slice(firstGroup * 4, Math.ceil(end / 3) * 4)
      const binary = atob(slice)
      const bytes = new Uint8Array(binary.length)
      for (let index = 0; index < binary.length; index++) bytes[index] = binary.charCodeAt(index)
      return bytes.subarray(start - firstGroup * 3, end - firstGroup * 3)
    }
  }
}

// Percent-encoding triples binary data; past this a payload is refused rather than decoded.
export const MAX_PERCENT_ENCODED_CHARS = 4 * 1024 * 1024

const hexValue = (code: number): number =>
  code >= 0x30 && code <= 0x39 ? code - 0x30 : (code | 0x20) >= 0x61 && (code | 0x20) <= 0x66 ? (code | 0x20) - 0x57 : -1

/** The bytes of a percent-encoded (non-base64) data: URI payload, as fetch() would decode them. */
export function percentSource(text: string): ByteSource | null {
  if (text.length > MAX_PERCENT_ENCODED_CHARS) return null
  const bytes = new Uint8Array(text.length * 3)
  const encoder = new TextEncoder()
  let length = 0
  for (let index = 0; index < text.length; index++) {
    const code = text.charCodeAt(index)
    const high = code === 0x25 ? hexValue(text.charCodeAt(index + 1)) : -1
    const low = high >= 0 ? hexValue(text.charCodeAt(index + 2)) : -1
    if (low >= 0) {
      bytes[length++] = high * 16 + low
      index += 2
    } else if (code < 0x80) {
      bytes[length++] = code
    } else {
      // Why a code point at a time: a surrogate pair is one UTF-8 sequence.
      const point = String.fromCodePoint(text.codePointAt(index) ?? code)
      length += encoder.encodeInto(point, bytes.subarray(length)).written
      index += point.length - 1
    }
  }
  return bytesSource(bytes.subarray(0, length))
}

/** The payload of a data: URI; null when it is not one or its base64 is malformed. */
export function dataUriSource(uri: string): ByteSource | null {
  if (!isDataUri(uri)) return null
  const comma = uri.indexOf(',')
  if (comma === -1) return null
  const payload = uri.slice(comma + 1)
  return /;base64$/i.test(uri.slice(0, comma)) ? base64Source(payload) : percentSource(payload)
}

export function subSource(source: ByteSource, offset: number, length: number): ByteSource {
  const end = Math.min(source.length, offset + length)
  return {
    length: Math.max(0, end - offset),
    read: (at, count) => source.read(offset + Math.max(0, at), Math.max(0, Math.min(count, end - offset - Math.max(0, at))))
  }
}

export type BufferSources = {
  buffer: (index: number) => ByteSource | null
  bufferView: (index: number) => ByteSource | null
}

/** Byte sources for a document's buffers and views, each buffer decoded at most once. */
export function bufferSources(document: GltfDocument, bin: Uint8Array | null): BufferSources {
  const buffers = Array.isArray(document.buffers) ? document.buffers : []
  const views = Array.isArray(document.bufferViews) ? document.bufferViews : []
  const cache = new Map<number, ByteSource | null>()
  const buffer = (index: number): ByteSource | null => {
    if (cache.has(index)) return cache.get(index) ?? null
    const entry = buffers[index]
    let source: ByteSource | null = null
    if (isRecord(entry)) {
      if (typeof entry.uri === 'string') source = dataUriSource(entry.uri)
      else if (index === 0 && bin) source = bytesSource(bin)
    }
    cache.set(index, source)
    return source
  }
  return {
    buffer,
    bufferView: (index) => {
      const view = views[index]
      if (!isRecord(view) || typeof view.buffer !== 'number') return null
      const source = buffer(view.buffer)
      const offset = typeof view.byteOffset === 'number' ? view.byteOffset : 0
      return source && typeof view.byteLength === 'number' ? subSource(source, offset, view.byteLength) : null
    }
  }
}
