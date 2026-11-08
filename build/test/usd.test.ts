import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { LoaderUtils } from 'three'
import { unzipSync } from 'three/examples/jsm/libs/fflate.module.js'
import { BUDGET } from '../src/gltf-budget.ts'
import { modelFormat } from '../src/model-format.ts'
import { checkModel, type ModelCheck } from '../src/model-refusal.ts'
import { readUsdzEntries, resolveAssetPath } from '../src/usd-inspection.ts'
import { pngHeader } from './fixtures/images.ts'
import { reference, renamed, textured, triangle, usda, usdz } from './fixtures/usd.ts'

const buffer = (bytes: Uint8Array): ArrayBuffer => bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer
const check = (data: Uint8Array | string): ModelCheck => checkModel('usd', typeof data === 'string' ? data : buffer(data))
const kind = (result: ModelCheck): string | null => {
  const found = result.refusal
  return found ? (found.kind === 'budget' ? `budget:${found.excess.kind}` : found.kind) : null
}
const reason = (result: ModelCheck): string => (result.refusal?.kind === 'corruptFile' ? result.refusal.reason : '')

describe('USD check', () => {
  it('passes a USDA layer and a USDZ package, and reads the unit the root layer states', () => {
    const stated = check(usdz([['model.usda', usda(triangle(), { metersPerUnit: 0.01 })]]))
    assert.deepEqual(stated.mesh && { metersPerUnit: stated.mesh.metersPerUnit, unitAssumed: stated.mesh.unitAssumed }, {
      metersPerUnit: 1,
      unitAssumed: false
    })
    const unstated = check(usda(triangle()))
    assert.deepEqual(unstated.mesh && { metersPerUnit: unstated.mesh.metersPerUnit, unitAssumed: unstated.mesh.unitAssumed }, {
      metersPerUnit: 0.01,
      unitAssumed: true
    })
    assert.equal(modelFormat(undefined, usda(triangle())), 'usd')
  })

  it('refuses compressed packages, which USDZ does not allow, before anything inflates', () => {
    assert.equal(kind(check(usdz([['model.usda', usda(triangle()).repeat(20)]], 6))), 'usdCompressed')
  })

  it('refuses binary layers, in a package or alone', () => {
    const crate = new TextEncoder().encode('PXR-USDC\0\0\0\0\0\0\0\0')
    assert.equal(kind(check(crate)), 'usdBinary')
    assert.equal(kind(check(usdz([['model.usdc', crate]]))), 'usdBinary')
  })

  it('refuses packages whose directory or names the loader would misread', () => {
    assert.match(reason(check(usdz([['texture.png', pngHeader(4, 4)], ['model.usda', usda(triangle())]]))), /first file/)
    // Why renamed afterwards: fflate cannot write an entry named __proto__ either.
    const proto = renamed(usdz([['model.usda', usda(triangle())], ['xxproto__', usda(triangle())]]), 'xxproto__', '__proto__')
    assert.match(reason(check(proto)), /named __proto__/)
    const truncated = usdz([['model.usda', usda(triangle())]])
    assert.match(reason(check(truncated.subarray(0, truncated.length - 30))), /ZIP directory/)
  })

  it('refuses entries that share bytes past the size of the file, which fflate would copy out once each', () => {
    const big = usda(triangle()) + `# ${'x'.repeat(10_000)}\n`
    const zipped = usdz([['model.usda', big], ...Array.from({ length: 8 }, (_, index): [string, string] => [`t${index}.png`, 'x'])])
    const view = new DataView(zipped.buffer, zipped.byteOffset, zipped.byteLength)
    const first = view.getUint32(zipped.length - 22 + 16, true)
    const next = (at: number): number => at + 46 + view.getUint16(at + 28, true) + view.getUint16(at + 30, true) + view.getUint16(at + 32, true)
    // Every small entry now claims the big layer's offset and size: nine copies of it, from one file.
    for (let at = next(first), index = 0; index < 8; at = next(at), index++) {
      for (const field of [20, 24, 42]) view.setUint32(at + field, view.getUint32(first + field, true), true)
    }
    assert.match(reason(check(zipped)), /overlap/)
  })

  it('refuses a layer that states a unit the composer would scale the model to nothing by', () => {
    for (const unit of [0, -1, Number.NaN]) assert.match(reason(check(usda(triangle(), { metersPerUnit: unit }))), /metersPerUnit/)
  })

  it('reads entries as fflate does', () => {
    const files: [string, string][] = [['model.usda', usda(reference('Part', 'parts/part.usda'))], ['parts/part.usda', usda(triangle())]]
    const zipped = usdz(files)
    const ours = readUsdzEntries(zipped).map(({ name, bytes }) => [name, [...bytes]])
    const theirs = Object.entries(unzipSync(zipped)).map(([name, bytes]) => [name, [...bytes]])
    assert.deepEqual(ours, theirs)
  })

  it('refuses names that would replace an object prototype when the loader stores them', () => {
    assert.match(reason(check(usda(`    def Xform "__proto__"\n    {\n    }\n`))), /__proto__/)
  })

  it('refuses layers that reference each other in a loop', () => {
    const loop = usdz([
      ['a.usda', usda(reference('B', 'b.usda'))],
      ['b.usda', usda(reference('A', 'a.usda'))]
    ])
    assert.match(reason(check(loop)), /loop/)
    assert.match(reason(check(usdz([['a.usda', usda(reference('Self', './a.usda'))]]))), /loop/)
  })

  it('counts a layer once per reference that composes it, so nested references cannot multiply past the budget', () => {
    // Each layer references the next twice: the last is composed 2^(depth - 1) times.
    const depth = 20
    const files: [string, string][] = Array.from({ length: depth }, (_, index) => [
      `l${index}.usda`,
      usda(index === depth - 1 ? triangle() : reference('Next', `l${index + 1}.usda`, 2))
    ])
    assert.equal(kind(check(usdz(files))), 'budget:nodes')
    assert.ok(2 ** (depth - 1) * 5 > BUDGET.nodes)
    assert.equal(kind(check(usdz(files.slice(-4)))), null)
  })

  it('names images and layers outside the package, and refuses an outside image a layer in a folder names', () => {
    const outside = check(usdz([['model.usda', usda(textured('wood.png') + reference('Part', 'part.usda'))]]))
    assert.deepEqual(outside.mesh && [outside.mesh.externalFiles, outside.mesh.externalLayers], [['wood.png'], ['part.usda']])
    const nested = usdz([
      ['model.usda', usda(reference('Part', 'parts/part.usda'))],
      ['parts/part.usda', usda(textured('https://example.com/wood.png'))]
    ])
    assert.match(reason(check(nested)), /not in the package/)
  })

  it('measures the images in a package against the budget', () => {
    const side = BUDGET.imageSide + 1
    const big = usdz([['model.usda', usda(textured('big.png'))], ['big.png', pngHeader(side, 1)]])
    assert.equal(kind(check(big)), 'budget:imageSide')
  })

  it('resolves asset paths as LoaderUtils does for USDComposer', () => {
    for (const [path, base] of [
      ['part.usda', 'parts'],
      ['./part.usda', 'parts/'],
      ['../part.usda', 'a/b'],
      ['https://example.com/x.png', 'parts'],
      ['part.usda', '']
    ]) {
      const clean = path.startsWith('./') ? path.slice(2) : path
      const expected = base ? LoaderUtils.resolveURL(clean, base.endsWith('/') ? base : `${base}/`) : clean
      assert.equal(resolveAssetPath(path, base), expected)
    }
  })
})
