// Speed Recommendation™ — intelligent speed calculation from multiple signals.
//
// Instead of a binary "faster/slower" decision, this engine produces a
// nuanced recommendation that accounts for accuracy trend, reaction time,
// momentum, and the current difficulty tier's profile.
// Sprint 6 AI Mentor™ can replace the recommendation logic without UI changes.

import type { SpeedMs, DifficultyTier } from '@/types/exercise-engine'
import { SPEED_TIERS, increaseSpeed, decreaseSpeed, getSpeedLabel } from './speedEngine'
import { getDifficultyProfile } from './difficultyProfiles'

export type SpeedTrend = 'improving' | 'stable' | 'declining'

export type SpeedRecommendationInput = {
  currentSpeedMs: SpeedMs
  currentTier: DifficultyTier
  accuracyPercent: number
  averageReactionMs: number        // ms from stimulus → response
  recentAccuracies: number[]       // last 5 sessions, most recent last
  momentumScore: number            // 0–100: streak / consistency score
}

export type SpeedRecommendation = {
  currentSpeed: SpeedMs
  currentSpeedLabel: string
  recommendedSpeed: SpeedMs
  recommendedSpeedLabel: string
  maximumSafeSpeed: SpeedMs        // fastest safe given accuracy trend
  trend: SpeedTrend
  confidence: number               // 0–100
  reason: string
  canAccelerate: boolean
}

// ── Trend detection ─────────────────────────────────────────────────────────

function detectTrend(recentAccuracies: number[]): SpeedTrend {
  if (recentAccuracies.length < 3) return 'stable'
  const recent = recentAccuracies.slice(-3)
  const older = recentAccuracies.slice(-5, -3)
  if (older.length === 0) return 'stable'
  const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length
  const olderAvg = older.reduce((a, b) => a + b, 0) / older.length
  if (recentAvg > olderAvg + 5) return 'improving'
  if (recentAvg < olderAvg - 5) return 'declining'
  return 'stable'
}

// ── Maximum safe speed ─────────────────────────────────────────────────────

// The fastest speed the student can safely attempt given current performance.
// Always at least 2 tiers slower than current if accuracy is struggling.
function computeMaximumSafeSpeed(
  currentSpeedMs: SpeedMs,
  accuracyPercent: number,
  trend: SpeedTrend,
): SpeedMs {
  if (accuracyPercent >= 90 && trend === 'improving') {
    // Can safely go up to 2 steps faster
    const step1 = increaseSpeed(currentSpeedMs, 50)
    return increaseSpeed(step1, 50)
  }
  if (accuracyPercent >= 80) {
    // One step faster is safe
    return increaseSpeed(currentSpeedMs, 50)
  }
  if (accuracyPercent < 65 || trend === 'declining') {
    // Step back one
    return decreaseSpeed(currentSpeedMs, 1000)
  }
  return currentSpeedMs
}

// ── Main recommendation ────────────────────────────────────────────────────

export function computeSpeedRecommendation(
  input: SpeedRecommendationInput,
): SpeedRecommendation {
  const {
    currentSpeedMs,
    currentTier,
    accuracyPercent,
    averageReactionMs,
    recentAccuracies,
    momentumScore,
  } = input

  const profile = getDifficultyProfile(currentTier)
  const trend = detectTrend(recentAccuracies)
  const maximumSafeSpeed = computeMaximumSafeSpeed(currentSpeedMs, accuracyPercent, trend)

  let recommendedSpeed: SpeedMs = currentSpeedMs
  let reason: string
  let confidence = 70

  // Decision matrix
  if (accuracyPercent >= 95 && averageReactionMs < profile.reactionTimeCeilingMs * 0.7) {
    // Excellent — accelerate
    recommendedSpeed = increaseSpeed(currentSpeedMs, profile.flashDurationMs)
    reason = `Accuracy ${accuracyPercent}% with fast reactions — increasing flash speed.`
    confidence = 90
  } else if (accuracyPercent >= 88 && trend === 'improving' && momentumScore >= 60) {
    // Good trend with momentum — gentle acceleration
    recommendedSpeed = increaseSpeed(currentSpeedMs, profile.flashDurationMs)
    reason = `Improving trend and strong momentum — slight speed increase.`
    confidence = 75
  } else if (accuracyPercent < 65 || (trend === 'declining' && accuracyPercent < 75)) {
    // Struggling — slow down
    recommendedSpeed = decreaseSpeed(currentSpeedMs, 1000)
    reason = `Accuracy ${accuracyPercent}% below threshold — reducing speed for consolidation.`
    confidence = 85
  } else if (averageReactionMs > profile.reactionTimeCeilingMs * 1.5 && averageReactionMs > 0) {
    // Reaction too slow — ease off
    recommendedSpeed = decreaseSpeed(currentSpeedMs, 1000)
    reason = `Reaction time ${Math.round(averageReactionMs)}ms suggests cognitive overload — reducing speed.`
    confidence = 80
  } else {
    // Hold
    recommendedSpeed = currentSpeedMs
    reason = `Performance is stable at ${accuracyPercent}% — maintaining current speed.`
    confidence = 65
  }

  // Never recommend faster than maximum safe
  const tiers = SPEED_TIERS as readonly SpeedMs[]
  const recommendedIdx = tiers.indexOf(recommendedSpeed)
  const safeIdx = tiers.indexOf(maximumSafeSpeed)
  if (recommendedIdx > safeIdx && recommendedSpeed < maximumSafeSpeed) {
    recommendedSpeed = maximumSafeSpeed
  }

  return {
    currentSpeed: currentSpeedMs,
    currentSpeedLabel: getSpeedLabel(currentSpeedMs),
    recommendedSpeed,
    recommendedSpeedLabel: getSpeedLabel(recommendedSpeed),
    maximumSafeSpeed,
    trend,
    confidence,
    reason,
    canAccelerate: recommendedSpeed < currentSpeedMs,
  }
}
