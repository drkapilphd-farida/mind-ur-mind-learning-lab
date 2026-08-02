// Peripheral Flash™ Progression — adaptive tier advancement. Reuses the
// same promotion/recovery engines every AIEE exercise uses, same shape as
// every other Flash mission's progression file.

import type { DifficultyTier } from '@/types/exercise-engine'
import { computePromotion } from '@/lib/exercise-engine/promotionRules'
import { computeRecovery } from '@/lib/exercise-engine/recoveryRules'
import { peripheralFlashUiLevel } from './peripheralFlashDifficulty'
import { increaseDifficulty, decreaseDifficulty } from '@/lib/exercise-engine/difficultyEngine'

export type PeripheralFlashProgressionResult = {
  nextTier: DifficultyTier
  promoted: boolean
  recovered: boolean
  reason: string
}

export function computePeripheralFlashProgression(input: {
  currentTier: DifficultyTier
  recentAccuracies: number[]
  averageReactionMs: number
  sessionsAtCurrentTier: number
}): PeripheralFlashProgressionResult {
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
      reason: `Advancing to ${peripheralFlashUiLevel(nextTier)} — your visual span is widening.`,
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
      reason: `Stepping back to ${peripheralFlashUiLevel(nextTier)} to consolidate peripheral awareness.`,
    }
  }

  return {
    nextTier: currentTier,
    promoted: false,
    recovered: false,
    reason: `Maintaining ${peripheralFlashUiLevel(currentTier)} — steady progress.`,
  }
}
