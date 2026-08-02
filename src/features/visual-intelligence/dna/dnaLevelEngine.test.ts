import { describe, expect, it } from 'vitest'
import { computeDnaLevel, DNA_LEVEL_NAME } from './dnaLevelEngine'
import type { UnifiedVisualStats } from '../adaptive/types/adaptiveTypes'

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

describe('computeDnaLevel', () => {
  it('defaults to Beginner with no history', () => {
    expect(computeDnaLevel(stats({}))).toBe(1)
    expect(DNA_LEVEL_NAME[1]).toBe('Beginner')
  })

  it('reaches Master only at 50 sessions and a 21-day streak', () => {
    expect(computeDnaLevel(stats({ completedSessionCount: 50, currentStreak: 21 }))).toBe(6)
    expect(computeDnaLevel(stats({ completedSessionCount: 50, currentStreak: 20 }))).toBe(5)
  })

  it('reaches Practitioner at 5 sessions and a 3-day streak', () => {
    expect(computeDnaLevel(stats({ completedSessionCount: 5, currentStreak: 3 }))).toBe(3)
  })
})
