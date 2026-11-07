// Which reader a document needs. Orca names the file type; the bytes decide when it does not.

export type MeshFormat = 'stl' | 'ply' | 'obj' | 'fbx'
export type ModelFormat = 'gltf' | MeshFormat

const BY_EXTENSION: Record<string, ModelFormat> = {
  '.glb': 'gltf',
  '.gltf': 'gltf',
  '.stl': 'stl',
  '.ply': 'ply',
  '.obj': 'obj',
  '.fbx': 'fbx'
}

export const FBX_BINARY_MAGIC = 'Kaydara FBX Binary  \0'

const startsWith = (bytes: Uint8Array, text: string): boolean =>
  bytes.length >= text.length && [...text].every((char, index) => bytes[index] === char.charCodeAt(0))

export function modelFormat(fileType: string | undefined, data: ArrayBuffer | string): ModelFormat {
  const named = fileType ? BY_EXTENSION[fileType.toLowerCase()] : undefined
  if (named) return named
  if (typeof data === 'string') return data.trimStart().startsWith('{') ? 'gltf' : 'obj'
  const head = new Uint8Array(data, 0, Math.min(data.byteLength, 32))
  if (startsWith(head, 'glTF')) return 'gltf'
  if (startsWith(head, FBX_BINARY_MAGIC)) return 'fbx'
  if (startsWith(head, 'ply')) return 'ply'
  return 'stl'
}

/** The bytes as Latin-1 text: one character per byte, so offsets and lengths stay the same. */
export function latin1(bytes: Uint8Array): string {
  return new TextDecoder('latin1').decode(bytes)
}
