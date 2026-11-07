import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { displayName, formatBytes, lengthFormat, MAX_NAME_CHARACTERS, nameList } from '../src/display-format.ts'
import { resolveLocale } from '../src/locale.ts'

describe('resolveLocale', () => {
  it('keeps a tag Intl can format with and repairs underscores', () => {
    assert.equal(resolveLocale('ja'), 'ja')
    assert.equal(resolveLocale('ja_JP'), 'ja-JP')
  })

  it('falls through malformed or empty tags to the next candidate, then English', () => {
    assert.equal(resolveLocale('', 'fr-FR'), 'fr-FR')
    assert.equal(resolveLocale('not a locale!', undefined), 'en')
    assert.equal(resolveLocale(undefined, '%%'), 'en')
  })
})

describe('lengthFormat', () => {
  const show = (meters: number[]): string => {
    const lengths = lengthFormat(meters, 'en')
    return `${meters.map(lengths.format).join(' × ')} ${lengths.unit}`
  }

  it('keeps meters for everyday sizes and buildings', () => {
    assert.equal(show([1, 1, 0]), '1 × 1 × 0 m')
    assert.equal(show([25.24, 79.37, 155.2]), '25.2 × 79.4 × 155 m')
    assert.equal(show([1200, 30, 400]), '1,200 × 30 × 400 m')
  })

  it('switches to a smaller unit instead of rounding tiny models to zero', () => {
    assert.equal(show([0.02, 0.01, 0.005]), '20 × 10 × 5 mm')
    assert.equal(show([3e-7, 2e-7, 1e-7]), '300 × 200 × 100 nm')
    assert.equal(show([0, 0, 0]), '0 × 0 × 0 m')
  })

  it('uses kilometers for terrain-sized models', () => {
    assert.equal(show([25_000, 100, 12_000]), '25 × 0.1 × 12 km')
  })
})

describe('formatBytes', () => {
  it('reads like a file size', () => {
    assert.equal(formatBytes(512 * 1024 * 1024, 'en'), '512 MB')
    assert.equal(formatBytes(1_200_000_000, 'en'), '1.12 GB')
  })
})

describe('names from the model', () => {
  it('strips bidirectional overrides and control characters, so a name cannot disguise itself', () => {
    assert.equal(displayName('‮gnp.exe'), '“gnp.exe”')
    assert.equal(displayName('a\u0000b\nc⁦d'), '“abcd”')
    assert.equal(displayName('zero​width line﻿tag\u{E0041} 2029'), '“zerowidthlinetag 2029”')
  })

  it('cuts a long name to a readable length', () => {
    const shown = displayName('x'.repeat(10_000))
    assert.equal([...shown].length, MAX_NAME_CHARACTERS + 2)
    assert.ok(shown.endsWith('…”'))
  })

  it('lists a few names and counts the rest', () => {
    const more = (list: string, count: number): string => `${list} and ${count} more`
    assert.equal(nameList(['a.png'], more), '“a.png”')
    assert.equal(nameList(['a', 'b', 'c', 'd', 'e'], more), '“a”, “b”, “c” and 2 more')
  })
})
