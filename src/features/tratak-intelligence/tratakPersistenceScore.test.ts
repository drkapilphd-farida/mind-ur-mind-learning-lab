import { describe, expect, it } from 'vitest'
import { computeTratakPersistenceScore } from './tratakPersistenceScore'

describe('computeTratakPersistenceScore', () => {
  it('is 0 when nothing has been practiced', () => {
    expect(
      computeTratakPersistenceScore({ completedMissionCount: 0, totalMissionCount: 6, currentStreak: 0, totalDurationSeconds: 0 }),
    ).toBe(0)
  })

  it('is 100 when every dimension is fully saturated', () => {
    expect(
      computeTratakPersistenceScore({ completedMissionCount: 6, totalMissionCount: 6, currentStreak: 14, totalDurationSeconds: 1800 }),
    ).toBe(100)
  })

  it('never exceeds 100 even when inputs overshoot their saturation points', () => {
    expect(
      computeTratakPersistenceScore({ completedMissionCount: 6, totalMissionCount: 6, currentStreak: 999, totalDurationSeconds: 999_999 }),
    ).toBe(100)
  })

  it('weighs breadth, consistency, and duration as documented', () => {
    const score = computeTratakPersistenceScore({
      completedMissionCount: 3,
      totalMissionCount: 6,
      currentStreak: 7,
      totalDurationSeconds: 900,
    })
    // breadth: 0.5*100*0.6=30, consistency: 0.5*100*0.25=12.5, duration: 0.5*100*0.15=7.5 => 50
    expect(score).toBe(50)
  })
})
