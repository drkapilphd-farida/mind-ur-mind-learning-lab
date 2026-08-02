// Visual Intelligence Lab™ — Visual DNA™, Sprint 8.
// Visual Intelligence Level™ — a new, distinct 6-level ladder (Beginner ..
// Master), deliberately not reusing Sprint-7's 5-level DifficultyLevelNumber
// (different name set, different granularity, scoped to the DNA profile).
// Evaluated highest-first, live-derived, never stored.

import type { DnaLevelName, DnaLevelNumber } from './dnaTypes'
import type { UnifiedVisualStats } from '../adaptive/types/adaptiveTypes'

export const DNA_LEVEL_NAME: Record<DnaLevelNumber, DnaLevelName> = {
  1: 'Beginner',
  2: 'Explorer',
  3: 'Practitioner',
  4: 'Advanced',
  5: 'Elite',
  6: 'Master',
}

export type DnaLevelThreshold = {
  level: DnaLevelNumber
  sessionThreshold: number
  streakThreshold: number
}

export const DNA_LEVEL_THRESHOLDS: readonly DnaLevelThreshold[] = [
  { level: 2, sessionThreshold: 5, streakThreshold: 0 },
  { level: 3, sessionThreshold: 5, streakThreshold: 3 },
  { level: 4, sessionThreshold: 15, streakThreshold: 7 },
  { level: 5, sessionThreshold: 30, streakThreshold: 14 },
  { level: 6, sessionThreshold: 50, streakThreshold: 21 },
]

export function computeDnaLevel(stats: UnifiedVisualStats): DnaLevelNumber {
  const { completedSessionCount, currentStreak } = stats

  if (completedSessionCount >= 50 && currentStreak >= 21) return 6
  if (completedSessionCount >= 30 && currentStreak >= 14) return 5
  if (completedSessionCount >= 15 && currentStreak >= 7) return 4
  if (completedSessionCount >= 5 && currentStreak >= 3) return 3
  if (completedSessionCount >= 5) return 2
  return 1
}
