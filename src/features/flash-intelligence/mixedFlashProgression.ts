// Mixed Flash™ Progression — adaptive tier advancement. Reuses the same
// promotion/recovery engines every AIEE exercise uses, same shape as
// word/number/symbolFlashProgression.ts.

import type { DifficultyTier } from '@/types/exercise-engine'
import { computePromotion } from '@/lib/exercise-engine/promotionRules'
import { computeRecovery } from '@/lib/exercise-engine/recoveryRules'
import { mixedFlashUiLevel } from './mixedFlashDifficulty'
import { increaseDifficulty, decreaseDifficulty } from '@/lib/exercise-engine/difficultyEngine'

export type MixedFlashProgressionResult = {
  nextTier: DifficultyTier
  promoted: boolean
  recovered: boolean
  reason: string
}

export function computeMixedFlashProgression(input: {
  currentTier: DifficultyTier
  recentAccuracies: number[]
  averageReactionMs: number
  sessionsAtCurrentTier: number
}): MixedFlashProgressionResult {
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
      reason: `Advancing to ${mixedFlashUiLevel(nextTier)} — excellent cognitive flexibility.`,
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
      reason: `Stepping back to ${mixedFlashUiLevel(nextTier)} to consolidate recognition switching.`,
    }
  }

  return {
    nextTier: currentTier,
    promoted: false,
    recovered: false,
    reason: `Maintaining ${mixedFlashUiLevel(currentTier)} — steady progress.`,
  }
}
