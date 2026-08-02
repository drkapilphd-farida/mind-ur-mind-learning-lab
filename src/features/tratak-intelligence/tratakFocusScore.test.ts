import { describe, expect, it } from 'vitest'
import { computeTratakFocusScore, difficultyToRatio } from './tratakFocusScore'

describe('difficultyToRatio', () => {
  it('maps each difficulty tier to its ratio', () => {
    expect(difficultyToRatio('Beginner')).toBeCloseTo(0.33)
    expect(difficultyToRatio('Intermediate')).toBeCloseTo(0.66)
    expect(difficultyToRatio('Advanced')).toBe(1)
  })
})

describe('computeTratakFocusScore', () => {
  it('is 0 when nothing has been practiced', () => {
    expect(
      computeTratakFocusScore({
        completedMissionCount: 0,
        totalMissionCount: 6,
        currentStreak: 0,
        totalDurationSeconds: 0,
        highestDifficultyRatio: 0,
      }),
    ).toBe(0)
  })

  it('is 100 when every dimension is fully saturated', () => {
    expect(
      computeTratakFocusScore({
        completedMissionCount: 6,
        totalMissionCount: 6,
        currentStreak: 14,
        totalDurationSeconds: 1800,
        highestDifficultyRatio: 1,
      }),
    ).toBe(100)
  })

  it('never exceeds 100 even when inputs overshoot their saturation points', () => {
    expect(
      computeTratakFocusScore({
        completedMissionCount: 6,
        totalMissionCount: 6,
        currentStreak: 999,
        totalDurationSeconds: 999_999,
        highestDifficultyRatio: 5,
      }),
    ).toBe(100)
  })

  it('weighs breadth, consistency, difficulty, and duration as documented', () => {
    const score = computeTratakFocusScore({
      completedMissionCount: 1,
      totalMissionCount: 6,
      currentStreak: 7,
      totalDurationSeconds: 900,
      highestDifficultyRatio: 0.33,
    })
    // breadth: (1/6)*100*0.4=6.667, consistency: 0.5*100*0.3=15, difficulty: 0.33*100*0.2=6.6, duration: 0.5*100*0.1=5 => 33.267 -> 33
    expect(score).toBe(33)
  })
})
