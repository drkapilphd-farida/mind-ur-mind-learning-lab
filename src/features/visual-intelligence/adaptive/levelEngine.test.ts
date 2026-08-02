import { describe, expect, it } from 'vitest'
import { computeLevelProgress, computeXpTotal } from './levelEngine'
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

describe('computeXpTotal', () => {
  it('passes through the unified stats XP total', () => {
    expect(computeXpTotal(stats({ totalXp: 145 }))).toBe(145)
  })
})

describe('computeLevelProgress', () => {
  it('reports Beginner at 0 with a next-level target of Explorer', () => {
    const result = computeLevelProgress(stats({}))
    expect(result.currentLevel).toBe(1)
    expect(result.currentLevelName).toBe('Beginner')
    expect(result.nextLevel).toBe(2)
    expect(result.nextLevelName).toBe('Explorer')
    // sessionProgress = 0/5 = 0, streakProgress = 1 (Explorer has no streak
    // requirement, so that half is automatically satisfied) -> avg 0.5
    expect(result.progress).toBe(0.5)
  })

  it('reports progress of 1 and no next level at Master', () => {
    const result = computeLevelProgress(stats({ completedSessionCount: 30, currentStreak: 14 }))
    expect(result.currentLevel).toBe(5)
    expect(result.currentLevelName).toBe('Master')
    expect(result.nextLevel).toBeNull()
    expect(result.progress).toBe(1)
  })

  it('computes partial progress toward the next level from real session/streak progress', () => {
    // Currently Beginner (Level 1); Explorer needs 5 sessions, 0 streak threshold.
    const result = computeLevelProgress(stats({ completedSessionCount: 2 }))
    expect(result.currentLevel).toBe(1)
    expect(result.nextLevel).toBe(2)
    // sessionProgress = 2/5 = 0.4, streakProgress = 1 (no streak threshold at level 2)
    expect(result.progress).toBeCloseTo(0.7, 5)
  })
})
