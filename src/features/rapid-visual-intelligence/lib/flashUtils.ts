// Shared utilities for all flash exercises.
import type { DifficultyTier } from '@/types/exercise-engine'
import type { FlashDuration } from '../adaptiveEngine'

// Map flash duration to difficulty tier.
// Shorter flash → simpler, shorter words (easier to process in limited time).
export function flashDurationToDifficulty(ms: number): DifficultyTier {
  if (ms >= 300) return 'medium'
  if (ms >= 150) return 'easy'
  return 'beginner'
}

export type { FlashDuration }
