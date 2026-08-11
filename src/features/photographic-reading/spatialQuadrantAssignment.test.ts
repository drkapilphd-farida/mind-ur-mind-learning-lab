import { describe, expect, it } from 'vitest'
import { SPATIAL_QUADRANTS, assignSpatialQuadrants } from './spatialQuadrantAssignment'

// A small deterministic PRNG (mulberry32) — real pseudo-randomness, not a
// constant stub, so the "no consecutive repeats" invariant is exercised
// against a genuinely varying sequence rather than trivially satisfied.
function createSeededRandom(seed: number): () => number {
  let state = seed >>> 0
  return () => {
    state = (state + 0x6d2b79f5) | 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

describe('assignSpatialQuadrants', () => {
  it('returns exactly one valid quadrant per unit', () => {
    const assignments = assignSpatialQuadrants(40, createSeededRandom(1))
    expect(assignments).toHaveLength(40)
    for (const quadrant of assignments) {
      expect(SPATIAL_QUADRANTS).toContain(quadrant)
    }
  })

  it('never repeats the same quadrant twice in a row across many draws', () => {
    const assignments = assignSpatialQuadrants(500, createSeededRandom(42))
    for (let i = 1; i < assignments.length; i++) {
      expect(assignments[i]).not.toBe(assignments[i - 1])
    }
  })

  it('uses every quadrant over a long enough sequence, not just a subset', () => {
    const assignments = assignSpatialQuadrants(200, createSeededRandom(7))
    expect(new Set(assignments).size).toBe(SPATIAL_QUADRANTS.length)
  })

  it('a single unit still returns one valid quadrant', () => {
    const assignments = assignSpatialQuadrants(1, createSeededRandom(3))
    expect(assignments).toHaveLength(1)
    expect(SPATIAL_QUADRANTS).toContain(assignments[0])
  })

  it('returns an empty array for zero units', () => {
    expect(assignSpatialQuadrants(0, createSeededRandom(9))).toEqual([])
  })

  it('terminates even against a degenerate randomFn that always repeats the same quadrant', () => {
    const assignments = assignSpatialQuadrants(10, () => 0)
    expect(assignments).toHaveLength(10)
  })
})
