// Promotion Rules™ — when to advance a student to the next difficulty tier.
//
// Promotion is conservative: multiple evidence points must ALL agree before
// a student is moved up. This prevents premature promotion that leads to
// immediate failure and loss of confidence.
// Sprint 6 AI Mentor™ can replace this function body without changing callers.

import type { DifficultyTier } from '@/types/exercise-engine'
import { getDifficultyProfile } from './difficultyProfiles'
import { increaseDifficulty } from './difficultyEngine'

export type PromotionInput = {
  currentTier: DifficultyTier
  // Last N accuracy values from progressCurve (most recent last)
  recentAccuracies: number[]
  // Average reaction time across recent sessions (ms)
  averageReactionMs: number
  // How many sessions completed at the current tier
  sessionsAtCurrentTier: number
  // Current Mind Score (0–1000) — higher score students get more aggressive promotions
  mindScore?: number
}

export type PromotionResult = {
  shouldPromote: boolean
  targetTier: DifficultyTier
  confidence: number    // 0–100: how certain the engine is
  reason: string
  blockedBy: string[]  // which conditions weren't met
}

export function computePromotion(input: PromotionInput): PromotionResult {
  const { currentTier, recentAccuracies, averageReactionMs, sessionsAtCurrentTier } = input
  const blockedBy: string[] = []

  // No promotion from master (highest tier) or adaptive (engine-controlled)
  if (currentTier === 'master' || currentTier === 'adaptive') {
    return {
      shouldPromote: false,
      targetTier: currentTier,
      confidence: 100,
      reason: currentTier === 'master' ? 'Already at master tier.' : 'Adaptive mode — engine controls tier.',
      blockedBy: [],
    }
  }

  const profile = getDifficultyProfile(currentTier)

  // Condition 1: enough sessions at the current tier
  if (sessionsAtCurrentTier < profile.minSessionsBeforePromotion) {
    blockedBy.push(`Need ${profile.minSessionsBeforePromotion} sessions at this tier (have ${sessionsAtCurrentTier})`)
  }

  // Condition 2: sufficient accuracy trend (use last 3 sessions or fewer)
  const window = recentAccuracies.slice(-3)
  if (window.length === 0) {
    blockedBy.push('No session data yet')
  } else {
    const avgAccuracy = window.reduce((a, b) => a + b, 0) / window.length
    if (avgAccuracy < profile.requiredAccuracyToPromote) {
      blockedBy.push(`Average accuracy ${Math.round(avgAccuracy)}% below ${profile.requiredAccuracyToPromote}% threshold`)
    }
    // Also require all recent sessions to be above 75% (no single bad session)
    const hasWeakSession = window.some((a) => a < 75)
    if (hasWeakSession) {
      blockedBy.push('One or more recent sessions below 75% — more consistency needed')
    }
  }

  // Condition 3: reaction time fast enough for the current tier
  if (averageReactionMs > profile.reactionTimeCeilingMs && averageReactionMs > 0) {
    blockedBy.push(`Average reaction ${Math.round(averageReactionMs)}ms above ${profile.reactionTimeCeilingMs}ms ceiling`)
  }

  const shouldPromote = blockedBy.length === 0
  const targetTier = shouldPromote ? increaseDifficulty(currentTier) : currentTier
  const confidence = shouldPromote
    ? Math.min(100, 60 + sessionsAtCurrentTier * 5)
    : Math.max(0, 100 - blockedBy.length * 25)

  return {
    shouldPromote,
    targetTier,
    confidence,
    reason: shouldPromote
      ? `Consistent performance at ${currentTier} — ready for ${targetTier}.`
      : `Not yet ready to advance from ${currentTier}.`,
    blockedBy,
  }
}
