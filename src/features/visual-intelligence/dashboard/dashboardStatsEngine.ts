// Visual Intelligence Lab™ — Visual Intelligence Dashboard™, Sprint 9.
// Statistics™ — 9 tiles, all real calculations, mostly pass-through of
// already-computed values. "Mind Score" reuses the global, dimension-
// agnostic computeMindScore (read-only import) fed by Visual Intelligence
// as its sole active dimension — honestly the same number as "Visual
// Score" today, disclosed as such, since no other Intelligence Lab
// contributes to it yet (same "N of M active" honesty pattern as
// Sprint-7's Neural Evolution Index).

import { computeMindScore } from '@/lib/exercises/mindScore'
import type { DnaContext } from '../dna/dnaContext'
import type { DnaLevelName } from '../dna/dnaTypes'

export type DashboardStats = {
  totalSessions: number
  trainingMinutes: number
  currentStreak: number
  longestStreak: number
  /** null when no accuracy-bearing session exists yet. */
  averageAccuracy: number | null
  visualScore: number
  visualDnaLevel: DnaLevelName
  xp: number
  mindScore: number
}

export function computeDashboardStats(context: DnaContext, visualDnaLevel: DnaLevelName): DashboardStats {
  const { completedSessionCount, totalDurationSeconds, currentStreak, bestStreak, successRate, totalXp } = context.unifiedStats

  const mindScore = computeMindScore([context.scoreProgress.currentScore / 10])

  return {
    totalSessions: completedSessionCount,
    trainingMinutes: Math.round(totalDurationSeconds / 60),
    currentStreak,
    longestStreak: bestStreak,
    averageAccuracy: successRate === null ? null : Math.round(successRate),
    visualScore: context.scoreProgress.currentScore,
    visualDnaLevel,
    xp: totalXp,
    mindScore,
  }
}
