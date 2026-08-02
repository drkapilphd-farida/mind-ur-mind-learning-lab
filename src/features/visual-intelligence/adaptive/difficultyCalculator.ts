// Visual Intelligence Lab™ — Adaptive Visual Intelligence™, Sprint 7.
// Difficulty Calculator — one of the 6 reusable, independent services this
// sprint builds. Current Difficulty is always live-derived from real
// stored history, never a separately stored/mutable value (so it can never
// drift from the activity that justifies it).

import type { DifficultyLevelNumber, DifficultyLevelName, UnifiedVisualStats } from './types/adaptiveTypes'

export const DIFFICULTY_LEVEL_NAME: Record<DifficultyLevelNumber, DifficultyLevelName> = {
  1: 'Beginner',
  2: 'Explorer',
  3: 'Focused',
  4: 'Advanced',
  5: 'Master',
}

export type DifficultyThreshold = {
  level: DifficultyLevelNumber
  sessionThreshold: number
  streakThreshold: number
}

// Level 1 has no threshold (fallback). 14-day streak saturation at Level 5
// matches every other streak formula's saturation point in this codebase.
export const DIFFICULTY_LEVEL_THRESHOLDS: readonly DifficultyThreshold[] = [
  { level: 2, sessionThreshold: 5, streakThreshold: 0 },
  { level: 3, sessionThreshold: 5, streakThreshold: 3 },
  { level: 4, sessionThreshold: 15, streakThreshold: 7 },
  { level: 5, sessionThreshold: 30, streakThreshold: 14 },
]

// Rule 1 (consistent completion -> increase difficulty) and Rule 4
// (consistent for multiple days -> unlock higher challenges) are both
// embodied directly in this threshold ladder — level advances automatically
// as completedSessionCount/currentStreak grow, evaluated highest-first so a
// learner always lands in the highest level whose full condition is met.
export function computeDifficultyLevel(stats: UnifiedVisualStats): DifficultyLevelNumber {
  const { completedSessionCount, currentStreak } = stats

  if (completedSessionCount >= 30 && currentStreak >= 14) return 5
  if (completedSessionCount >= 15 && currentStreak >= 7) return 4
  if (completedSessionCount >= 5 && currentStreak >= 3) return 3
  if (completedSessionCount >= 5) return 2
  return 1
}

// Rule 2 (many skipped sessions -> keep current level) and Rule 3
// (repeated early exits -> suggest easier challenge) both depend on
// skippedSessions/restartCount, which are honestly always 0 today (no
// Sprint 1-6 table has ever recorded a skip or restart). Both branches are
// kept here, documented and ready, rather than deleted — once real
// instrumentation exists upstream (never by editing Sprint 1-6 files),
// this function activates them without needing to be rewritten.
export function applyDifficultyRules(stats: UnifiedVisualStats): DifficultyLevelNumber {
  const baseLevel = computeDifficultyLevel(stats)

  // Rule 2: many skipped sessions -> keep current level (currently a no-op,
  // since skippedSessions is always 0).
  if (stats.skippedSessions >= 5) return baseLevel

  // Rule 3 doesn't change the level number itself (it "suggests an easier
  // challenge," which is a recommendationEngine.ts concern) — see
  // selectChallenge() there.

  return baseLevel
}
