// Chunk Progression™ — adaptive chunk size advancement.
// Reuses the Sprint 5D promotion/recovery engines; chunk size maps to
// difficulty tier so all existing adaptive machinery applies automatically.

import type { DifficultyTier } from '@/types/exercise-engine'
import { computePromotion } from '@/lib/exercise-engine/promotionRules'
import { computeRecovery } from '@/lib/exercise-engine/recoveryRules'
import { getChunkProfile } from './chunkDifficulty'
import { increaseDifficulty, decreaseDifficulty } from '@/lib/exercise-engine/difficultyEngine'

export type ChunkProgressionResult = {
  nextTier: DifficultyTier
  nextWordsPerChunk: number
  promoted: boolean
  recovered: boolean
  reason: string
}

export function computeChunkProgression(input: {
  currentTier: DifficultyTier
  recentAccuracies: number[]
  averageReactionMs: number
  sessionsAtCurrentTier: number
}): ChunkProgressionResult {
  const { currentTier, recentAccuracies, averageReactionMs, sessionsAtCurrentTier } = input
  const profile = getChunkProfile(currentTier)

  // Reuse Sprint 5D promotion engine — same multi-factor logic
  const promotion = computePromotion({
    currentTier,
    recentAccuracies,
    averageReactionMs,
    sessionsAtCurrentTier,
  })

  if (promotion.shouldPromote) {
    const nextTier = increaseDifficulty(currentTier)
    const nextProfile = getChunkProfile(nextTier)
    return {
      nextTier,
      nextWordsPerChunk: nextProfile.wordsPerChunk,
      promoted: true,
      recovered: false,
      reason: `Chunk size increasing from ${profile.wordsPerChunk} to ${nextProfile.wordsPerChunk} words — excellent performance.`,
    }
  }

  // Reuse Sprint 5D recovery engine
  const recovery = computeRecovery({
    currentTier,
    recentAccuracies,
    averageReactionMs,
    consecutiveCompletions: sessionsAtCurrentTier,
  })

  if (recovery.shouldRecover) {
    const nextTier = decreaseDifficulty(currentTier)
    const nextProfile = getChunkProfile(nextTier)
    return {
      nextTier,
      nextWordsPerChunk: nextProfile.wordsPerChunk,
      promoted: false,
      recovered: true,
      reason: `Stepping back to ${nextProfile.wordsPerChunk}-word chunks to consolidate recognition speed.`,
    }
  }

  return {
    nextTier: currentTier,
    nextWordsPerChunk: profile.wordsPerChunk,
    promoted: false,
    recovered: false,
    reason: `Maintaining ${profile.wordsPerChunk}-word chunks — steady progress.`,
  }
}
