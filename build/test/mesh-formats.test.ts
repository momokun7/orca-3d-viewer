import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { deflateSync } from 'node:zlib'
import fc from 'fast-check'
import { FBX_LIMITS, FBX_MIN_VERSION } from '../src/fbx-inspection.ts'
import { textStlGeometry } from '../src/mesh-model-parse.ts'
import { type MeshFormat, modelFormat } from '../src/model-format.ts'
import { checkModel, type Refusal } from '../src/model-refusal.ts'
import {
  asciiPly,
  asciiStl,
  binaryPly,
  binaryStl,
  D,
  fbx,
  type FbxNode,
  fbxTriangle,
  L,
  obj,
  S,
  TRIANGLE
} from './fixtures/meshes.ts'
import { reference, triangle, usda, usdz } from './fixtures/usd.ts'
import { crate, triangleSpecs } from './fixtures/usdc.ts'

const buffer = (bytes: Uint8Array): ArrayBuffer => bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer
const text = (value: string): ArrayBuffer => buffer(new TextEncoder().encode(value))
const refusal = (check: ReturnType<typeof checkModel>): Refusal | null => check.refusal
const kind = (check: ReturnType<typeof checkModel>): string | null => {
  const found = refusal(check)
  return found ? (found.kind === 'budget' ? `budget:${found.excess.kind}` : found.kind) : null
}

describe('modelFormat', () => {
  it('follows the file type Orca names, and reads the bytes when there is none', () => {
    // Orca names the suffix without its dot; a dot is accepted too.
    assert.equal(modelFormat('usdz', new ArrayBuffer(0)), 'usd')
    assert.equal(modelFormat('.STL', new ArrayBuffer(0)), 'stl')
    assert.equal(modelFormat(undefined, buffer(usdz([['model.usda', usda(triangle())]]))), 'usd')
    assert.equal(modelFormat(undefined, buffer(fbxTriangle())), 'fbx')
    assert.equal(modelFormat(undefined, text(asciiPly())), 'ply')
    assert.equal(modelFormat(undefined, '{"asset":{}}'), 'gltf')
    assert.equal(modelFormat(undefined, obj()), 'obj')
  })
})

describe('STL, PLY and OBJ checks', () => {
  it('pass well-formed files', () => {
    assert.equal(kind(checkModel('stl', buffer(binaryStl()))), null)
    assert.equal(kind(checkModel('stl', text(asciiStl()))), null)
    assert.equal(kind(checkModel('ply', text(asciiPly()))), null)
    assert.equal(kind(checkModel('ply', buffer(binaryPly()))), null)
    assert.equal(kind(checkModel('obj', obj())), null)
  })

  it('refuse a binary STL or PLY whose header declares more than the file holds', () => {
    assert.equal(kind(checkModel('stl', buffer(binaryStl([TRIANGLE], 1_000_000)))), 'corruptFile')
    assert.equal(kind(checkModel('ply', buffer(binaryPly([[0, 1, 2]], 1_000_000)))), 'corruptFile')
    assert.equal(kind(checkModel('ply', text(asciiPly({ faces: [[0, 1]] })))), null)
  })

  it('refuse PLY headers the loader would misread or store under prototype names', () => {
    for (const header of [
      ['format binary_middle_endian 1.0', 'element vertex 3', 'property float x'],
      ['format ascii 1.0', 'element vertex 3', 'property quad x'],
      ['format ascii 1.0', 'element vertex 3', 'property float __proto__'],
      ['format ascii 1.0', 'element constructor 3', 'property float x'],
      ['format ascii 1.0', 'element vertex 3', 'property float x', 'element face 1', 'property list uchar int corners']
    ]) {
      assert.equal(kind(checkModel('ply', text(asciiPly({ header })))), 'corruptFile', header.join(' / '))
    }
  })

  it('count the triangles a polygon fans into, so one long face cannot multiply memory', () => {
    const corners = 3_000_000
    assert.equal(kind(checkModel('obj', obj(`f ${'1 '.repeat(corners)}`))), 'budget:geometryBytes')
    assert.equal(kind(checkModel('ply', buffer(binaryPly([Array.from({ length: 255 }, () => 0)])))), null)
  })

  it('note an OBJ that names material files the frame cannot read', () => {
    const check = checkModel('obj', `mtllib model.mtl\n${obj()}`)
    assert.equal(check.mesh?.materialFiles, true)
  })
})

describe('FBX check', () => {
  it('passes a binary FBX, raw or compressed, 32- or 64-bit, and reads its unit', () => {
    assert.equal(checkModel('fbx', buffer(fbxTriangle())).mesh?.metersPerUnit, 0.01)
    assert.equal(checkModel('fbx', buffer(fbxTriangle({ compress: true, unitScale: 100 }))).mesh?.metersPerUnit, 1)
    assert.equal(checkModel('fbx', buffer(fbxTriangle({ version: 7500 }))).mesh?.metersPerUnit, 0.01)
  })

  it('refuses text FBX and versions the loader cannot build', () => {
    assert.equal(kind(checkModel('fbx', '; FBX 7.4.0 project file\nFBXHeaderExtension:  {\n}')), 'fbxText')
    assert.equal(kind(checkModel('fbx', text('; FBX 7.4.0 project file\nFBXHeaderExtension:  {\n}'))), 'fbxText')
    const old = refusal(checkModel('fbx', buffer(fbxTriangle({ version: FBX_MIN_VERSION - 900 }))))
    assert.deepEqual(old, { kind: 'fbxVersion', version: FBX_MIN_VERSION - 900 })
  })

  it('stops inflating an array once it passes its declared length', () => {
    const bomb = new Uint8Array(deflateSync(new Uint8Array(64 * 1024 * 1024)))
    const file = fbxTriangle({ geometryChildren: [{ name: 'Normals', properties: [{ type: 'd', value: [0, 0, 1], raw: bomb }] }] })
    const started = performance.now()
    const check = refusal(checkModel('fbx', buffer(file)))
    assert.equal(check?.kind, 'corruptFile')
    assert.match(check?.kind === 'corruptFile' ? check.reason : '', /inflates past/)
    assert.ok(performance.now() - started < 1000, 'the check stopped early instead of inflating it all')
  })

  it('refuses arrays that hold fewer items than they declare, and declared sizes past the budget', () => {
    const short = fbxTriangle({ geometryChildren: [{ name: 'Normals', properties: [{ type: 'd', value: [0, 0, 1], declared: 30 }] }] })
    assert.equal(kind(checkModel('fbx', buffer(short))), 'corruptFile')
    const huge = new Uint8Array(deflateSync(new Uint8Array(0)))
    const declared = fbxTriangle({ geometryChildren: [{ name: 'Normals', properties: [{ type: 'd', value: [], raw: huge, declared: 2 ** 31 }] }] })
    assert.equal(kind(checkModel('fbx', buffer(declared))), 'budget:geometryBytes')
  })

  it('refuses nodes and properties named after an object prototype', () => {
    const named = fbx([{ name: '__proto__', properties: [S('x')] }])
    assert.equal(kind(checkModel('fbx', buffer(named))), 'corruptFile')
    const property = fbx([{ name: 'GlobalSettings', children: [{ name: 'Properties70', children: [{ name: 'P', properties: [S('__proto__'), S('double'), S(''), S(''), D(1)] }] }] }])
    assert.equal(kind(checkModel('fbx', buffer(property))), 'corruptFile')
  })

  it('refuses nesting deeper than the limit, and offsets outside the parent', () => {
    let deep: FbxNode = { name: 'Leaf', properties: [L(1)] }
    for (let level = 0; level < FBX_LIMITS.depth + 1; level++) deep = { name: 'Node', children: [deep] }
    assert.equal(kind(checkModel('fbx', buffer(fbx([deep])))), 'corruptFile')
    const file = fbxTriangle()
    new DataView(file.buffer).setUint32(27, file.length * 2, true)
    assert.equal(kind(checkModel('fbx', buffer(file))), 'corruptFile')
  })

  it('refuses truncated files and every prefix of a valid one without throwing', () => {
    const file = fbxTriangle({ compress: true })
    for (let length = 0; length < file.length - 160; length += 7) {
      assert.doesNotThrow(() => checkModel('fbx', buffer(file.subarray(0, length))))
    }
  })
})

describe('mesh checks on corrupted files', () => {
  const FUZZ_RUNS = Number(process.env.FUZZ_RUNS ?? 2000)
  const FUZZ_SEED = process.env.FUZZ_SEED ? Number(process.env.FUZZ_SEED) : undefined
  const seeds: [MeshFormat, Uint8Array][] = [
    ['stl', binaryStl()],
    ['stl', new TextEncoder().encode(asciiStl())],
    ['ply', new TextEncoder().encode(asciiPly())],
    ['ply', binaryPly()],
    ['obj', new TextEncoder().encode(obj())],
    ['fbx', fbxTriangle()],
    ['fbx', fbxTriangle({ compress: true, version: 7500 })],
    ['usd', new TextEncoder().encode(usda(triangle()))],
    ['usd', usdz([['model.usda', usda(triangle() + reference('Part', 'part.usda'))], ['part.usda', usda(triangle())]])],
    ['usd', crate(triangleSpecs({ metersPerUnit: 1 })).bytes],
    ['usd', usdz([['model.usdc', crate(triangleSpecs()).bytes]])]
  ]

  it('pass or refuse every corrupted file, never throwing', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...seeds),
        fc.array(fc.tuple(fc.nat(), fc.integer({ min: 0, max: 255 })), { minLength: 1, maxLength: 16 }),
        fc.option(fc.nat()),
        ([format, seed], flips, cut) => {
          const bytes = seed.slice(0, cut === null ? seed.length : (cut % seed.length) + 1)
          for (const [at, value] of flips) bytes[at % bytes.length] = value
          const data = format === 'obj' ? new TextDecoder().decode(bytes) : buffer(bytes)
          const check = checkModel(format, data)
          assert.ok((check.mesh === null) !== (check.refusal === null))
        }
      ),
      { numRuns: FUZZ_RUNS, seed: FUZZ_SEED }
    )
  })
})

describe('text STL', () => {
  it('reads its triangles in one pass, so crafted runs cannot stall it as STLLoader stalls', () => {
    assert.equal(textStlGeometry(asciiStl([TRIANGLE, TRIANGLE])).getAttribute('position').count, 6)
    const crafted = `solid x\n${'facet '.repeat(100_000)}vertex${' '.repeat(200_000)}1\n${'solid '.repeat(100_000)}`
    const started = performance.now()
    assert.equal(textStlGeometry(crafted).getAttribute('position').count, 0)
    assert.ok(performance.now() - started < 1000)
  })
})
