// Performance Engine™ — computes all session metrics and Mind Score contribution.
//
// Absorbs buildSessionSummary() from Sprint 4C-1's adaptiveEngine.ts and
// extends it with reaction time, consistency, and difficulty bonuses.
// Pure functions — no side effects.

import type {
  PerformanceMetrics,
  SpeedMs,
  DifficultyTier,
  ScoringRules,
  AdaptiveRules,
} from '@/types/exercise-engine'
import { DEFAULT_SCORING_RULES, SPEED_TIERS } from '@/types/exercise-engine'

// Compute performance metrics for one completed session.
export function computePerformanceMetrics(input: {
  correctCount: number
  totalCount: number
  sessionDurationMs: number
  speedMs: SpeedMs
  difficultyTier: DifficultyTier
  scoringRules?: ScoringRules
}): PerformanceMetrics {
  const {
    correctCount,
    totalCount,
    sessionDurationMs,
    speedMs,
    difficultyTier,
    scoringRules = DEFAULT_SCORING_RULES,
  } = input

  const accuracyPercent = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0

  // Speed score: faster = higher (100ms → 1.0, 500ms → 0.2, 1000ms → 0.0)
  const speedScore = Math.max(0, Math.min(1, (1000 - speedMs) / 950))

  // Accuracy score: 0–100% maps to 0–1.0
  const accuracyScore = accuracyPercent / 100

  // Weighted performance score (0–100)
  const rawScore =
    accuracyScore * scoringRules.accuracyWeight +
    speedScore * scoringRules.speedWeight

  const difficultyMultiplier = scoringRules.difficultyMultiplier[difficultyTier] ?? 1.0
  const performanceScore = Math.min(100, Math.round(rawScore * 100 * difficultyMultiplier))

  // Mind Score contribution: max 5 points per session, earned by completing well
  const mindScoreContribution = Math.round((performanceScore / 100) * 5)

  return {
    accuracyPercent,
    correctCount,
    totalCount,
    sessionDurationMs,
    speedMs,
    difficultyTier,
    // Reaction time fields default to 0 when called from Sprint 5A code paths
    // that don't yet pass response-level timing. Sprint 5B's runtime hook
    // computes these inline from ItemResponse[] instead.
    averageReactionTimeMs: 0,
    fastestReactionTimeMs: 0,
    performanceScore,
    mindScoreContribution,
  }
}

// Compute the next speed based on accuracy vs thresholds.
// Replaces computeNextDuration() from Sprint 4C-1 with the universal version.
export function computeNextSpeed(
  currentSpeed: SpeedMs,
  accuracyPercent: number,
  rules: AdaptiveRules,
): SpeedMs {
  const tiers = SPEED_TIERS as readonly SpeedMs[]
  const idx = tiers.indexOf(currentSpeed)

  if (accuracyPercent > rules.increaseSpeedAbove) {
    // Go faster (lower ms, higher index in the sorted-descending array)
    const candidate = tiers[idx + 1]
    if (candidate !== undefined && candidate >= rules.minSpeedMs) return candidate
  }
  if (accuracyPercent < rules.decreaseSpeedBelow) {
    // Go slower (higher ms, lower index)
    const candidate = tiers[idx - 1]
    if (candidate !== undefined && candidate <= rules.maxSpeedMs) return candidate
  }
  return currentSpeed
}

// A motivational message based on accuracy — never generic.
export function getAccuracyMessage(accuracyPercent: number): string {
  if (accuracyPercent >= 90) return 'Exceptional visual recognition.'
  if (accuracyPercent >= 75) return 'Strong performance. Your processing is sharpening.'
  if (accuracyPercent >= 60) return 'Good start. Consistency builds the skill.'
  return 'Keep practicing — the pattern will click.'
}

// Summarise whether this session was a personal best
export function checkPersonalBest(
  accuracyPercent: number,
  prevBestAccuracy: number,
  currentSpeed: SpeedMs,
  prevFastestSpeed: SpeedMs,
): { newAccuracyBest: boolean; newSpeedBest: boolean } {
  return {
    newAccuracyBest: accuracyPercent > prevBestAccuracy,
    newSpeedBest: currentSpeed < prevFastestSpeed,
  }
}
