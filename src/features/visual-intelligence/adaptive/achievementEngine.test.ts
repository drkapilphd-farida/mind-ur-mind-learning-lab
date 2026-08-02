import { describe, expect, it } from 'vitest'
import { computeAchievements } from './achievementEngine'
import type { UnifiedVisualStats, UnlockedAchievement } from './types/adaptiveTypes'

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

function find(achievements: ReturnType<typeof computeAchievements>, id: string): UnlockedAchievement {
  const match = achievements.find((a) => a.id === id)
  if (!match) throw new Error(`missing achievement ${id}`)
  return match
}

describe('computeAchievements', () => {
  it('unlocks nothing with no history', () => {
    const achievements = computeAchievements(stats({}))
    expect(achievements.every((a) => !a.unlocked)).toBe(true)
  })

  it('unlocks First Session at 1 completed session', () => {
    expect(find(computeAchievements(stats({ completedSessionCount: 1 })), 'first-session').unlocked).toBe(true)
  })

  it('unlocks Seven Day Streak at a 7-day best streak', () => {
    expect(find(computeAchievements(stats({ bestStreak: 7 })), 'seven-day-streak').unlocked).toBe(true)
  })

  it('requires both a minimum sample size and a real rate for Observation Master', () => {
    const tooFewSessions = find(
      computeAchievements(stats({ persistenceChallengeCompletedCount: 2, observationJournalUsageRate: 1 })),
      'observation-master',
    )
    expect(tooFewSessions.unlocked).toBe(false)

    const qualifies = find(
      computeAchievements(stats({ persistenceChallengeCompletedCount: 5, observationJournalUsageRate: 0.8 })),
      'observation-master',
    )
    expect(qualifies.unlocked).toBe(true)
  })

  it('unlocks Visual Explorer only with breadth across at least 3 session types', () => {
    const onlyTwo = find(
      computeAchievements(stats({ fixationCompletedCount: 1, persistenceChallengeCompletedCount: 1 })),
      'visual-explorer',
    )
    expect(onlyTwo.unlocked).toBe(false)

    const three = find(
      computeAchievements(
        stats({ fixationCompletedCount: 1, persistenceChallengeCompletedCount: 1, imagePersistenceCompletedCount: 1 }),
      ),
      'visual-explorer',
    )
    expect(three.unlocked).toBe(true)
  })

  it('unlocks Persistence Champion only with both session count and streak conditions met', () => {
    const streakOnly = find(computeAchievements(stats({ currentStreak: 10 })), 'persistence-champion')
    expect(streakOnly.unlocked).toBe(false)

    const both = find(
      computeAchievements(stats({ persistenceChallengeCompletedCount: 15, currentStreak: 7 })),
      'persistence-champion',
    )
    expect(both.unlocked).toBe(true)
  })
})
