// Recovery Rules™ — when to gently reduce difficulty.
//
// Recovery is intentionally soft: the engine never demotes more than one
// tier per event, never below beginner, and requires clear sustained struggle
// before acting. A single bad session is normal; two consecutive bad sessions
// at the same tier triggers reassessment.
// Sprint 6 AI Mentor™ can replace this function body without changing callers.

import type { DifficultyTier } from '@/types/exercise-engine'
import { getDifficultyProfile } from './difficultyProfiles'
import { decreaseDifficulty } from './difficultyEngine'

export type RecoveryInput = {
  currentTier: DifficultyTier
  // Last N accuracy values from progressCurve (most recent last)
  recentAccuracies: number[]
  // Average reaction time (ms) — very slow reaction may indicate overloading
  averageReactionMs: number
  // How many consecutive sessions completed (not skipped/exited early)
  consecutiveCompletions: number
}

export type RecoveryResult = {
  shouldRecover: boolean
  targetTier: DifficultyTier  // always at most one step down
  reason: string
  severity: 'none' | 'mild' | 'moderate'  // inform the UI message tone
}

export function computeRecovery(input: RecoveryInput): RecoveryResult {
  const { currentTier, recentAccuracies, averageReactionMs } = input

  // Can't recover below beginner or from adaptive
  if (currentTier === 'beginner' || currentTier === 'adaptive') {
    return {
      shouldRecover: false,
      targetTier: currentTier,
      reason: currentTier === 'beginner'
        ? 'Already at the foundation level — consistency is the next step.'
        : 'Adaptive mode is handling difficulty.',
      severity: 'none',
    }
  }

  const profile = getDifficultyProfile(currentTier)

  // Need at least 2 sessions to evaluate
  if (recentAccuracies.length < 2) {
    return { shouldRecover: false, targetTier: currentTier, reason: 'Not enough sessions to evaluate.', severity: 'none' }
  }

  // Check last 2 sessions
  const lastTwo = recentAccuracies.slice(-2)
  const bothBelow = lastTwo.every((a) => a < profile.recoveryAccuracyThreshold)

  // Check for very slow reaction time (2× the ceiling)
  const reactionOverloaded = averageReactionMs > 0 && averageReactionMs > profile.reactionTimeCeilingMs * 2

  const shouldRecover = bothBelow || reactionOverloaded
  const targetTier = shouldRecover ? decreaseDifficulty(currentTier) : currentTier

  const avgAccuracy = lastTwo.reduce((a, b) => a + b, 0) / lastTwo.length
  const severity: RecoveryResult['severity'] = !shouldRecover
    ? 'none'
    : reactionOverloaded && bothBelow
      ? 'moderate'
      : 'mild'

  return {
    shouldRecover,
    targetTier,
    reason: shouldRecover
      ? `Average accuracy ${Math.round(avgAccuracy)}% signals this level needs more time. Stepping back to build solid foundations.`
      : 'Performance is within acceptable range — hold current tier.',
    severity,
  }
}
