// Number Flash™ Progression — adaptive tier advancement. Reuses the same
// promotion/recovery engines every AIEE exercise uses (Sprint 5D) — no new
// adaptive algorithm for this mission, same as Word Flash.

import type { DifficultyTier } from '@/types/exercise-engine'
import { computePromotion } from '@/lib/exercise-engine/promotionRules'
import { computeRecovery } from '@/lib/exercise-engine/recoveryRules'
import { numberFlashUiLevel } from './numberFlashDifficulty'
import { increaseDifficulty, decreaseDifficulty } from '@/lib/exercise-engine/difficultyEngine'

export type NumberFlashProgressionResult = {
  nextTier: DifficultyTier
  promoted: boolean
  recovered: boolean
  reason: string
}

export function computeNumberFlashProgression(input: {
  currentTier: DifficultyTier
  recentAccuracies: number[]
  averageReactionMs: number
  sessionsAtCurrentTier: number
}): NumberFlashProgressionResult {
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
      reason: `Advancing to ${numberFlashUiLevel(nextTier)} — excellent visual recognition speed.`,
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
      reason: `Stepping back to ${numberFlashUiLevel(nextTier)} to consolidate recognition speed.`,
    }
  }

  return {
    nextTier: currentTier,
    promoted: false,
    recovered: false,
    reason: `Maintaining ${numberFlashUiLevel(currentTier)} — steady progress.`,
  }
}
