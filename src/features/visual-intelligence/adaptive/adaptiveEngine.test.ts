import { describe, expect, it } from 'vitest'
import { runAdaptiveEngine } from './adaptiveEngine'
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

describe('runAdaptiveEngine', () => {
  it('composes an honest all-zero result with no history', () => {
    const result = runAdaptiveEngine(stats({}))
    expect(result.difficultyLevel).toBe(1)
    expect(result.difficultyLevelName).toBe('Beginner')
    expect(result.recommendation.suggestedDurationSeconds).toBe(30)
    expect(result.recommendation.estimatedTrainingTimeSeconds).toBe(90)
    expect(result.performance.visualReadiness).toBe(0)
    expect(result.achievements.every((a) => !a.unlocked)).toBe(true)
    expect(result.levelProgress.currentLevel).toBe(1)
  })

  it('composes a fully-unlocked result for a Master-level learner', () => {
    const result = runAdaptiveEngine(
      stats({
        completedSessionCount: 30,
        currentStreak: 14,
        bestStreak: 14,
        fixationCompletedCount: 20,
        persistenceChallengeCompletedCount: 15,
        imagePersistenceCompletedCount: 5,
        observationJournalUsageRate: 0.9,
      }),
    )
    expect(result.difficultyLevel).toBe(5)
    expect(result.difficultyLevelName).toBe('Master')
    expect(result.recommendation.suggestedDurationSeconds).toBe(90)
    expect(result.levelProgress.progress).toBe(1)
    expect(result.levelProgress.nextLevel).toBeNull()
  })
})
