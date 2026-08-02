import { describe, expect, it } from 'vitest'
import { computePerformanceMetrics } from './performanceEngine'
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

describe('computePerformanceMetrics', () => {
  it('returns all zeros with no history', () => {
    const metrics = computePerformanceMetrics(stats({}))
    expect(metrics.visualStability).toBe(0)
    expect(metrics.observationConsistency).toBe(0)
    expect(metrics.focusGrowth).toBe(0)
    expect(metrics.trainingFrequency).toBe(0)
    expect(metrics.persistenceLevel).toBe(0)
    expect(metrics.visualReadiness).toBe(0)
  })

  it('saturates visualStability at a 14-day streak', () => {
    expect(computePerformanceMetrics(stats({ currentStreak: 14 })).visualStability).toBe(100)
    expect(computePerformanceMetrics(stats({ currentStreak: 30 })).visualStability).toBe(100)
  })

  it('saturates focusGrowth at 20 fixation completions', () => {
    expect(computePerformanceMetrics(stats({ fixationCompletedCount: 20 })).focusGrowth).toBe(100)
  })

  it('saturates trainingFrequency at 30 total completions', () => {
    expect(computePerformanceMetrics(stats({ completedSessionCount: 30 })).trainingFrequency).toBe(100)
  })

  it('saturates persistenceLevel at 15 persistence-challenge completions', () => {
    expect(computePerformanceMetrics(stats({ persistenceChallengeCompletedCount: 15 })).persistenceLevel).toBe(100)
  })

  it('treats a null observationJournalUsageRate as an honest 0, not a fabricated value', () => {
    expect(computePerformanceMetrics(stats({ observationJournalUsageRate: null })).observationConsistency).toBe(0)
  })

  it('computes visualReadiness as the average of the other 5 metrics', () => {
    const metrics = computePerformanceMetrics(
      stats({ currentStreak: 14, fixationCompletedCount: 20, completedSessionCount: 30, persistenceChallengeCompletedCount: 15, observationJournalUsageRate: 1 }),
    )
    expect(metrics.visualReadiness).toBe(100)
  })
})
