// Symbol Flash™ Progression — adaptive tier advancement for the
// BETWEEN-session axis (speed + symbol pool complexity). Reuses the same
// promotion/recovery engines every AIEE exercise uses. The within-session
// compositional stage (1/2/3/mixed symbols) is a separate, fixed arc —
// see symbolFlashDifficulty.ts — and is not affected by this.

import type { DifficultyTier } from '@/types/exercise-engine'
import { computePromotion } from '@/lib/exercise-engine/promotionRules'
import { computeRecovery } from '@/lib/exercise-engine/recoveryRules'
import { symbolFlashUiLevel } from './symbolFlashDifficulty'
import { increaseDifficulty, decreaseDifficulty } from '@/lib/exercise-engine/difficultyEngine'

export type SymbolFlashProgressionResult = {
  nextTier: DifficultyTier
  promoted: boolean
  recovered: boolean
  reason: string
}

export function computeSymbolFlashProgression(input: {
  currentTier: DifficultyTier
  recentAccuracies: number[]
  averageReactionMs: number
  sessionsAtCurrentTier: number
}): SymbolFlashProgressionResult {
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
      reason: `Advancing to ${symbolFlashUiLevel(nextTier)} — excellent visual recognition speed.`,
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
      reason: `Stepping back to ${symbolFlashUiLevel(nextTier)} to consolidate recognition speed.`,
    }
  }

  return {
    nextTier: currentTier,
    promoted: false,
    recovered: false,
    reason: `Maintaining ${symbolFlashUiLevel(currentTier)} — steady progress.`,
  }
}
