import { describe, expect, it } from 'vitest'
import { computeDifficultyLevel } from './difficultyCalculator'
import type { UnifiedVisualStats } from './types/adaptiveTypes'

function stats(overrides: Partial<UnifiedVisualStats>): UnifiedVisualStats {
  return {
    completedSessionCount: 0,
    imagePersistenceCompletedCount: 0,
    fixationCompletedCount: 0,
    persistenceChallengeCompletedCount: 0,
    visualPreparationCompletedCount: 0,
    currentStreak: 0,
    bestStreak: 0,
    totalDurationSeconds: 0,
    avgSessionTimeSeconds: 0,
    successRate: null,
    observationJournalUsageRate: null,
    restartCount: 0,
    skippedSessions: 0,
    totalXp: 0,
    ...overrides,
  }
}

describe('computeDifficultyLevel', () => {
  it('defaults to Beginner (1) with no history', () => {
    expect(computeDifficultyLevel(stats({}))).toBe(1)
  })

  it('reaches Explorer (2) at 5 completed sessions with no streak', () => {
    expect(computeDifficultyLevel(stats({ completedSessionCount: 5, currentStreak: 0 }))).toBe(2)
  })

  it('reaches Focused (3) at 5 sessions and a 3-day streak', () => {
    expect(computeDifficultyLevel(stats({ completedSessionCount: 5, currentStreak: 3 }))).toBe(3)
  })

  it('reaches Advanced (4) at 15 sessions and a 7-day streak', () => {
    expect(computeDifficultyLevel(stats({ completedSessionCount: 15, currentStreak: 7 }))).toBe(4)
  })

  it('reaches Master (5) at 30 sessions and a 14-day streak', () => {
    expect(computeDifficultyLevel(stats({ completedSessionCount: 30, currentStreak: 14 }))).toBe(5)
  })

  it('does not advance past Focused if streak is missing even with many sessions', () => {
    expect(computeDifficultyLevel(stats({ completedSessionCount: 100, currentStreak: 0 }))).toBe(2)
  })
})
