import { describe, it, expect } from 'vitest'
import { shuffleIndices, shuffleArray } from './randomizationEngine'

describe('shuffleIndices', () => {
  it('is a permutation of 0..length-1', () => {
    const result = shuffleIndices(4, 123456789)
    expect([...result].sort((a, b) => a - b)).toEqual([0, 1, 2, 3])
  })

  it('is deterministic for a given seed', () => {
    expect(shuffleIndices(4, 42)).toEqual(shuffleIndices(4, 42))
  })

  // Regression test for a real, severe bug found while verifying Word
  // Flash's "randomize answer positions" requirement: the previous
  // implementation reduced the LCG output via `s % (i + 1)`, which uses
  // an LCG's low-order bits — poorly distributed by construction. With
  // this codebase's actual seed pattern (Date.now() + small per-item
  // offsets), that collapsed to the SAME final position 100% of the time
  // across 20,000 realistic trials — meaning every multiple-choice
  // exercise on the platform was placing the correct answer in one
  // predictable slot. This test uses that exact real-world seed shape
  // (not arbitrary/random seeds) so it would have caught the bug.
  it('does not collapse to a single predictable position for realistic session/item seed patterns', () => {
    const positionCounts = [0, 0, 0, 0]
    const base = Date.now()
    for (let session = 0; session < 200; session++) {
      const sessionSeed = base + session * 99991
      for (let i = 0; i < 20; i++) {
        const itemSeed = sessionSeed + i * 31337
        const result = shuffleIndices(4, itemSeed)
        const position = result.indexOf(0)
        positionCounts[position] = (positionCounts[position] ?? 0) + 1
      }
    }
    const total = positionCounts.reduce((a, b) => a + b, 0)
    // Each of the 4 positions should appear a meaningful fraction of the
    // time — nowhere close to the fully-degenerate 0% seen with the bug.
    // 10% is a generous floor (uniform would be 25%); this only needs to
    // catch a catastrophic collapse, not assert perfect uniformity.
    for (const count of positionCounts) {
      expect(count / total).toBeGreaterThan(0.10)
    }
  })
})

describe('shuffleArray', () => {
  it('returns every original element exactly once', () => {
    const input = ['a', 'b', 'c', 'd']
    const result = shuffleArray(input, 7)
    expect([...result].sort()).toEqual([...input].sort())
  })

  it('does not always place the first element in the same output slot', () => {
    // Same underlying property as the shuffleIndices regression test,
    // exercised through the public array-shuffling API every exercise
    // engine actually calls.
    const positions = new Set<number>()
    const base = Date.now()
    for (let session = 0; session < 100; session++) {
      for (let i = 0; i < 20; i++) {
        const seed = base + session * 99991 + i * 31337
        const result = shuffleArray(['correct', 'd1', 'd2', 'd3'], seed)
        positions.add(result.indexOf('correct'))
      }
    }
    expect(positions.size).toBeGreaterThan(1)
  })
})
