import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { axisSegmentsFor, gridCellSizeFor } from '../src/scene-guides.ts'

describe('axisSegmentsFor', () => {
  it('runs the floor axes edge to edge so they show past a model built around its origin', () => {
    assert.deepEqual(axisSegmentsFor(0, 0, 5), [
      { from: [-5, 0, 0], to: [5, 0, 0] },
      { from: [0, 0, 0], to: [0, 10, 0] },
      { from: [0, 0, -5], to: [0, 0, 5] }
    ])
  })

  it('still reaches the origin under an off-origin model', () => {
    const [x, , z] = axisSegmentsFor(100, -40, 5)
    assert.deepEqual(x, { from: [0, 0, 0], to: [105, 0, 0] })
    assert.deepEqual(z, { from: [0, 0, -45], to: [0, 0, 0] })
  })
})

describe('gridCellSizeFor', () => {
  it('picks a power-of-ten cell so a model spans several cells whatever its unit scale', () => {
    assert.equal(gridCellSizeFor(1), 0.1)
    assert.equal(gridCellSizeFor(1.8), 0.1)
    assert.equal(gridCellSizeFor(2.5), 1)
    assert.equal(gridCellSizeFor(150), 10)
    assert.ok(Math.abs(gridCellSizeFor(0.03) - 0.01) < 1e-12)
  })

  it('still yields a positive cell for a degenerate, zero-size model', () => {
    assert.ok(gridCellSizeFor(0) > 0)
  })
})
