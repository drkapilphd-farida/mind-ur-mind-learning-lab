// Visual Intelligence Lab™ — Adaptive Visual Intelligence™, Sprint 7.
// Recommendation Engine — Adaptive Timing, Adaptive Challenge Selection,
// and Adaptive Goals. Every decision is a deterministic function of real
// stored stats — never random, never fabricated.

import { computeDifficultyLevel } from './difficultyCalculator'
import type { AdaptiveGoal, AdaptiveTimingSeconds, ChallengeSelection, DifficultyLevelNumber, UnifiedVisualStats } from './types/adaptiveTypes'

const TIMING_BY_LEVEL: Record<DifficultyLevelNumber, AdaptiveTimingSeconds> = {
  1: 30,
  2: 45,
  3: 60,
  4: 75,
  5: 90,
}

const TIMING_STEP_DOWN: Record<AdaptiveTimingSeconds, AdaptiveTimingSeconds> = {
  30: 30,
  45: 30,
  60: 45,
  75: 60,
  90: 75,
}

// Adaptive Timing: base value is the level's fixed default; if the learner
// has a real, measurable accuracy signal below 50%, step down one tier
// (never below 30s) rather than also raising duration while they're still
// struggling with accuracy at this level. Never random.
export function recommendTiming(stats: UnifiedVisualStats): AdaptiveTimingSeconds {
  const level = computeDifficultyLevel(stats)
  const base = TIMING_BY_LEVEL[level]
  if (stats.successRate !== null && stats.successRate < 50) {
    return TIMING_STEP_DOWN[base]
  }
  return base
}

// Adaptive Challenge Selection.
export function selectChallenge(stats: UnifiedVisualStats): ChallengeSelection {
  // Rule 3 (repeated early exits -> suggest easier) — dormant today since
  // restartCount is always 0, kept ready for future instrumentation.
  if (stats.restartCount >= 3) return 'suggest-easier'
  if (stats.successRate !== null && stats.successRate < 50) return 'suggest-easier'
  if (stats.currentStreak >= 7 && stats.completedSessionCount >= 15) return 'suggest-harder'
  if (stats.currentStreak >= 1) return 'move-to-next'
  return 'repeat-previous'
}

// Adaptive Goals.
export function recommendGoal(stats: UnifiedVisualStats): AdaptiveGoal {
  if (stats.successRate !== null && stats.successRate < 60) return 'Improve Focus'
  if (stats.avgSessionTimeSeconds >= 75 && stats.currentStreak >= 7) return 'Increase Observation Quality'
  return 'Increase Duration'
}
