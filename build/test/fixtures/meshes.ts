// STL, PLY, OBJ and FBX files built in code, so each test states exactly what its file holds.
import { deflateSync } from 'node:zlib'

type Vec3 = [number, number, number]
/** A right triangle with 1-unit legs on the XY plane. */
export const TRIANGLE: Vec3[] = [
  [0, 0, 0],
  [1, 0, 0],
  [0, 1, 0]
]

export function binaryStl(triangles: Vec3[][] = [TRIANGLE], declared = triangles.length): Uint8Array {
  const bytes = new Uint8Array(84 + 50 * triangles.length)
  const view = new DataView(bytes.buffer)
  view.setUint32(80, declared, true)
  triangles.forEach((corners, index) => {
    const at = 84 + index * 50 + 12
    corners.flat().forEach((value, component) => view.setFloat32(at + component * 4, value, true))
  })
  return bytes
}

export function asciiStl(triangles: Vec3[][] = [TRIANGLE]): string {
  const facets = triangles.map(
    (corners) => `facet normal 0 0 1\nouter loop\n${corners.map((c) => `vertex ${c.join(' ')}`).join('\n')}\nendloop\nendfacet`
  )
  return `solid test\n${facets.join('\n')}\nendsolid test\n`
}

/** A PLY of the triangle; `header` lines replace the generated ones, to declare what the body is not. */
export function asciiPly({ faces = [[0, 1, 2]], header }: { faces?: number[][]; header?: string[] } = {}): string {
  const lines = header ?? [
    'format ascii 1.0',
    `element vertex ${TRIANGLE.length}`,
    'property float x',
    'property float y',
    'property float z',
    `element face ${faces.length}`,
    'property list uchar int vertex_indices'
  ]
  const body = [...TRIANGLE.map((corner) => corner.join(' ')), ...faces.map((face) => `${face.length} ${face.join(' ')}`)]
  return `ply\n${lines.join('\n')}\nend_header\n${body.join('\n')}\n`
}

export function binaryPly(faces: number[][] = [[0, 1, 2]], declaredFaces = faces.length): Uint8Array {
  const header = new TextEncoder().encode(
    `ply\nformat binary_little_endian 1.0\nelement vertex ${TRIANGLE.length}\nproperty float x\nproperty float y\nproperty float z\n` +
      `element face ${declaredFaces}\nproperty list uchar int vertex_indices\nend_header\n`
  )
  const bodyBytes = TRIANGLE.length * 12 + faces.reduce((sum, face) => sum + 1 + face.length * 4, 0)
  const bytes = new Uint8Array(header.length + bodyBytes)
  bytes.set(header)
  const view = new DataView(bytes.buffer)
  let at = header.length
  for (const corner of TRIANGLE) for (const value of corner) (view.setFloat32(at, value, true), (at += 4))
  for (const face of faces) {
    view.setUint8(at++, face.length)
    for (const index of face) (view.setInt32(at, index, true), (at += 4))
  }
  return bytes
}

export function obj(extra = ''): string {
  return `${TRIANGLE.map((corner) => `v ${corner.join(' ')}`).join('\n')}\nf 1 2 3\n${extra}`
}

// FBX binary: a record per node (end offset, property count, property bytes, name), its
// properties, its children, then a null record. Version 7500 and later widen the three counts.
export type FbxProperty =
  | { type: 'I' | 'D'; value: number }
  | { type: 'L'; value: bigint }
  | { type: 'S'; value: string }
  | { type: 'R'; value: Uint8Array }
  | { type: 'd' | 'i'; value: number[]; compress?: boolean; declared?: number; raw?: Uint8Array }
export type FbxNode = { name: string; properties?: FbxProperty[]; children?: FbxNode[] }

export const S = (value: string): FbxProperty => ({ type: 'S', value })
export const L = (value: number): FbxProperty => ({ type: 'L', value: BigInt(value) })
export const D = (value: number): FbxProperty => ({ type: 'D', value })

function concat(parts: Uint8Array[]): Uint8Array {
  const out = new Uint8Array(parts.reduce((sum, part) => sum + part.length, 0))
  let at = 0
  for (const part of parts) (out.set(part, at), (at += part.length))
  return out
}

function encodeProperty(property: FbxProperty): Uint8Array {
  const tag = new TextEncoder().encode(property.type)
  switch (property.type) {
    case 'I':
    case 'D': {
      const bytes = new Uint8Array(property.type === 'I' ? 4 : 8)
      const view = new DataView(bytes.buffer)
      if (property.type === 'I') view.setInt32(0, property.value, true)
      else view.setFloat64(0, property.value, true)
      return concat([tag, bytes])
    }
    case 'L': {
      const bytes = new Uint8Array(8)
      new DataView(bytes.buffer).setBigInt64(0, property.value, true)
      return concat([tag, bytes])
    }
    case 'S':
    case 'R': {
      const body = property.type === 'S' ? new TextEncoder().encode(property.value) : property.value
      const length = new Uint8Array(4)
      new DataView(length.buffer).setUint32(0, body.length, true)
      return concat([tag, length, body])
    }
    case 'd':
    case 'i': {
      const itemBytes = property.type === 'd' ? 8 : 4
      const plain = new Uint8Array(property.value.length * itemBytes)
      const view = new DataView(plain.buffer)
      property.value.forEach((value, index) =>
        property.type === 'd' ? view.setFloat64(index * 8, value, true) : view.setInt32(index * 4, value, true)
      )
      const stored = property.raw ?? (property.compress ? new Uint8Array(deflateSync(plain)) : plain)
      const head = new Uint8Array(12)
      const headView = new DataView(head.buffer)
      headView.setUint32(0, property.declared ?? property.value.length, true)
      headView.setUint32(4, property.compress || property.raw ? 1 : 0, true)
      headView.setUint32(8, stored.length, true)
      return concat([tag, head, stored])
    }
  }
}

function encodeNode(node: FbxNode, offset: number, wide: boolean): Uint8Array {
  const word = wide ? 8 : 4
  const name = new TextEncoder().encode(node.name)
  const properties = concat((node.properties ?? []).map(encodeProperty))
  const headerBytes = word * 3 + 1 + name.length
  let at = offset + headerBytes + properties.length
  const children: Uint8Array[] = []
  for (const child of node.children ?? []) {
    const encoded = encodeNode(child, at, wide)
    children.push(encoded)
    at += encoded.length
  }
  if (children.length > 0) {
    children.push(new Uint8Array(word * 3 + 1))
    at += word * 3 + 1
  }
  const header = new Uint8Array(headerBytes)
  const view = new DataView(header.buffer)
  const put = (index: number, value: number): void =>
    wide ? view.setBigUint64(index * 8, BigInt(value), true) : view.setUint32(index * 4, value, true)
  put(0, at)
  put(1, node.properties?.length ?? 0)
  put(2, properties.length)
  header[word * 3] = name.length
  header.set(name, word * 3 + 1)
  return concat([header, properties, ...children])
}

export function fbx(nodes: FbxNode[], version = 7400): Uint8Array {
  const wide = version >= 7500
  const head = new Uint8Array(27)
  head.set(new TextEncoder().encode('Kaydara FBX Binary  \0\x1a\0'))
  new DataView(head.buffer).setUint32(23, version, true)
  const parts: Uint8Array[] = [head]
  let at = 27
  for (const node of nodes) {
    const encoded = encodeNode(node, at, wide)
    parts.push(encoded)
    at += encoded.length
  }
  // The footer the loader stops before: 160 bytes it does not read.
  parts.push(new Uint8Array(160))
  return concat(parts)
}

/** A one-triangle FBX scene: a mesh geometry, its model, and the connections between them. */
export function fbxTriangle({
  compress = false,
  unitScale = 1,
  geometryChildren = [] as FbxNode[],
  version = 7400
} = {}): Uint8Array {
  return fbx(
    [
      { name: 'GlobalSettings', children: [{ name: 'Properties70', children: [{ name: 'P', properties: [S('UnitScaleFactor'), S('double'), S('Number'), S(''), D(unitScale)] }] }] },
      {
        name: 'Objects',
        children: [
          {
            name: 'Geometry',
            properties: [L(1), S('Triangle\0\x01Geometry'), S('Mesh')],
            children: [
              { name: 'Vertices', properties: [{ type: 'd', value: TRIANGLE.flat(), compress }] },
              { name: 'PolygonVertexIndex', properties: [{ type: 'i', value: [0, 1, -3], compress }] },
              ...geometryChildren
            ]
          },
          { name: 'Model', properties: [L(2), S('Triangle\0\x01Model'), S('Mesh')], children: [{ name: 'Version', properties: [{ type: 'I', value: 232 }] }] }
        ]
      },
      {
        name: 'Connections',
        children: [
          { name: 'C', properties: [S('OO'), L(1), L(2)] },
          { name: 'C', properties: [S('OO'), L(2), L(0)] }
        ]
      }
    ],
    version
  )
}
