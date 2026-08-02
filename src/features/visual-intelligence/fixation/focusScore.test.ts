import { describe, expect, it } from 'vitest'
import { computeFocusScore, getHighestDifficultyRatio } from './focusScore'

describe('getHighestDifficultyRatio', () => {
  it('returns 0 when nothing has been completed', () => {
    expect(getHighestDifficultyRatio([])).toBe(0)
  })

  it('ignores incomplete sessions', () => {
    const ratio = getHighestDifficultyRatio([{ exerciseType: 'static-dot', level: '90', completed: false }])
    expect(ratio).toBe(0)
  })

  it('takes the highest completed level within a single exercise type', () => {
    const ratio = getHighestDifficultyRatio([
      { exerciseType: 'static-dot', level: '30', completed: true },
      { exerciseType: 'static-dot', level: '90', completed: true },
    ])
    expect(ratio).toBe(1)
  })

  it('averages only across exercise types actually practiced, never fabricating untried types', () => {
    const ratio = getHighestDifficultyRatio([
      { exerciseType: 'static-dot', level: '90', completed: true }, // ratio 1
      { exerciseType: 'multi-dot', level: '3', completed: true }, // ratio 3/7
    ])
    expect(ratio).toBeCloseTo((1 + 3 / 7) / 2, 5)
  })
})

describe('computeFocusScore', () => {
  it('returns 0 for a student with no history', () => {
    expect(
      computeFocusScore({ completedSessionCount: 0, currentStreak: 0, highestDifficultyRatio: 0, totalDurationSeconds: 0 }),
    ).toBe(0)
  })

  it('saturates breadth at 20 completed sessions', () => {
    const at20 = computeFocusScore({ completedSessionCount: 20, currentStreak: 0, highestDifficultyRatio: 0, totalDurationSeconds: 0 })
    const at40 = computeFocusScore({ completedSessionCount: 40, currentStreak: 0, highestDifficultyRatio: 0, totalDurationSeconds: 0 })
    expect(at20).toBe(40)
    expect(at40).toBe(40)
  })

  it('saturates consistency at a 14-day streak', () => {
    const at14 = computeFocusScore({ completedSessionCount: 0, currentStreak: 14, highestDifficultyRatio: 0, totalDurationSeconds: 0 })
    const at30 = computeFocusScore({ completedSessionCount: 0, currentStreak: 30, highestDifficultyRatio: 0, totalDurationSeconds: 0 })
    expect(at14).toBe(30)
    expect(at30).toBe(30)
  })

  it('never exceeds 100 even at maximum saturation on every input', () => {
    const score = computeFocusScore({
      completedSessionCount: 999,
      currentStreak: 999,
      highestDifficultyRatio: 1,
      totalDurationSeconds: 999_999,
    })
    expect(score).toBe(100)
  })

  it('weights breadth, consistency, difficulty, and duration as 40/30/20/10', () => {
    const score = computeFocusScore({
      completedSessionCount: 10, // half of 20 -> 20
      currentStreak: 7, // half of 14 -> 15
      highestDifficultyRatio: 0.5, // half of 20 -> 10
      totalDurationSeconds: 1800, // half of 3600 -> 5
    })
    expect(score).toBe(50)
  })
})
