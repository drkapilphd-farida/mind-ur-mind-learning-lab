import { describe, expect, it } from 'vitest'
import { computeReadingXp } from './computeReadingXp'

describe('computeReadingXp', () => {
  it('XP: awards 10 XP per completed exercise and 5 XP per streak day', () => {
    expect(computeReadingXp(4, 3)).toEqual({ totalXp: 55, fromCompletedExercises: 40, fromStreak: 15 })
  })

  it('returns zero XP for a brand-new learner', () => {
    expect(computeReadingXp(0, 0)).toEqual({ totalXp: 0, fromCompletedExercises: 0, fromStreak: 0 })
  })

  it('Determinism: identical inputs produce identical output', () => {
    expect(computeReadingXp(7, 2)).toEqual(computeReadingXp(7, 2))
  })
})
