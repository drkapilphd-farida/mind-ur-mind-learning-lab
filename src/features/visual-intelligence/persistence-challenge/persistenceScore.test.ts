import { describe, expect, it } from 'vitest'
import { computePersistenceScore } from './persistenceScore'

describe('computePersistenceScore', () => {
  it('returns 0 for a student with no history', () => {
    expect(computePersistenceScore(0, 0)).toBe(0)
  })

  it('saturates breadth at 15 completed sessions', () => {
    expect(computePersistenceScore(15, 0)).toBe(60)
    expect(computePersistenceScore(30, 0)).toBe(60)
  })

  it('saturates consistency at a 14-day streak', () => {
    expect(computePersistenceScore(0, 14)).toBe(40)
    expect(computePersistenceScore(0, 30)).toBe(40)
  })

  it('never exceeds 100 at maximum saturation on both inputs', () => {
    expect(computePersistenceScore(999, 999)).toBe(100)
  })

  it('weights breadth and consistency as 60/40', () => {
    // Half of 15 -> 30, half of 14 (7) -> 20
    expect(computePersistenceScore(7.5, 7)).toBe(50)
  })
})
