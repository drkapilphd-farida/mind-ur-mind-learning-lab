// Word Flash™ Progression — adaptive tier advancement. Reuses the same
// promotion/recovery engines every AIEE exercise uses (Sprint 5D) — no new
// adaptive algorithm for this pack.

import type { DifficultyTier } from '@/types/exercise-engine'
import { computePromotion } from '@/lib/exercise-engine/promotionRules'
import { computeRecovery } from '@/lib/exercise-engine/recoveryRules'
import { getWordFlashProfile, wordFlashUiLevel } from './wordFlashDifficulty'
import { increaseDifficulty, decreaseDifficulty } from '@/lib/exercise-engine/difficultyEngine'

export type WordFlashProgressionResult = {
  nextTier: DifficultyTier
  promoted: boolean
  recovered: boolean
  reason: string
}

export function computeWordFlashProgression(input: {
  currentTier: DifficultyTier
  recentAccuracies: number[]
  averageReactionMs: number
  sessionsAtCurrentTier: number
}): WordFlashProgressionResult {
  const { currentTier, recentAccuracies, averageReactionMs, sessionsAtCurrentTier } = input

  const promotion = computePromotion({
    currentTier,
    recentAccuracies,
    averageReactionMs,
    sessionsAtCurrentTier,
  })

  if (promotion.shouldPromote) {
    const nextTier = increaseDifficulty(currentTier)
    return {
      nextTier,
      promoted: true,
      recovered: false,
      reason: `Advancing to ${wordFlashUiLevel(nextTier)} — excellent recognition speed.`,
    }
  }

  const recovery = computeRecovery({
    currentTier,
    recentAccuracies,
    averageReactionMs,
    consecutiveCompletions: sessionsAtCurrentTier,
  })

  if (recovery.shouldRecover) {
    const nextTier = decreaseDifficulty(currentTier)
    return {
      nextTier,
      promoted: false,
      recovered: true,
      reason: `Stepping back to ${wordFlashUiLevel(nextTier)} to consolidate recognition speed.`,
    }
  }

  return {
    nextTier: currentTier,
    promoted: false,
    recovered: false,
    reason: `Maintaining ${wordFlashUiLevel(currentTier)} — steady progress.`,
  }
}

// Re-exported for callers that only need the current tier's timing profile
// without recomputing progression — kept here so components have one
// import surface for both.
export { getWordFlashProfile }
