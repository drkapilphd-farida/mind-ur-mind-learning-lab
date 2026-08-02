// Visual Intelligence Lab™ — Adaptive Visual Intelligence™, Sprint 7.
// Achievement Engine — 7 adaptive achievements, all derived live from real
// unified stats. No "unlocked_at" ledger is stored; unlocked state is
// simply whether the condition is true right now, same "live over stored"
// precedent as the rest of this engine.

import type { UnifiedVisualStats, UnlockedAchievement } from './types/adaptiveTypes'

function clampProgress(value: number): number {
  return Math.max(0, Math.min(1, value))
}

export function computeAchievements(stats: UnifiedVisualStats): readonly UnlockedAchievement[] {
  const typesWithAtLeastOne = [
    stats.imagePersistenceCompletedCount,
    stats.fixationCompletedCount,
    stats.persistenceChallengeCompletedCount,
    stats.visualPreparationCompletedCount,
  ].filter((count) => count > 0).length

  const observationMasterEligible = clampProgress(stats.persistenceChallengeCompletedCount / 5)
  const observationMasterRate = clampProgress((stats.observationJournalUsageRate ?? 0) / 0.8)

  return [
    {
      id: 'first-session',
      title: 'First Session',
      description: 'Complete your first Visual Intelligence session.',
      unlocked: stats.completedSessionCount >= 1,
      progressToward: clampProgress(stats.completedSessionCount / 1),
    },
    {
      id: 'five-sessions',
      title: 'Five Sessions',
      description: 'Complete 5 Visual Intelligence sessions.',
      unlocked: stats.completedSessionCount >= 5,
      progressToward: clampProgress(stats.completedSessionCount / 5),
    },
    {
      id: 'seven-day-streak',
      title: 'Seven Day Streak',
      description: 'Practice 7 days in a row.',
      unlocked: stats.bestStreak >= 7,
      progressToward: clampProgress(stats.bestStreak / 7),
    },
    {
      id: 'observation-master',
      title: 'Observation Master',
      description: 'Use the observation journal in at least 80% of your persistence challenges (min. 5 completed).',
      unlocked: stats.persistenceChallengeCompletedCount >= 5 && (stats.observationJournalUsageRate ?? 0) >= 0.8,
      progressToward: Math.min(observationMasterEligible, observationMasterRate),
    },
    {
      id: 'focus-builder',
      title: 'Focus Builder',
      description: 'Complete 10 Visual Fixation Engine sessions.',
      unlocked: stats.fixationCompletedCount >= 10,
      progressToward: clampProgress(stats.fixationCompletedCount / 10),
    },
    {
      id: 'visual-explorer',
      title: 'Visual Explorer',
      description: 'Try at least 3 of the 4 Visual Intelligence Lab experiences.',
      unlocked: typesWithAtLeastOne >= 3,
      progressToward: clampProgress(typesWithAtLeastOne / 3),
    },
    {
      id: 'persistence-champion',
      title: 'Persistence Champion',
      description: 'Complete 15 persistence challenges while on a 7-day streak.',
      unlocked: stats.persistenceChallengeCompletedCount >= 15 && stats.currentStreak >= 7,
      progressToward: Math.min(clampProgress(stats.persistenceChallengeCompletedCount / 15), clampProgress(stats.currentStreak / 7)),
    },
  ]
}
