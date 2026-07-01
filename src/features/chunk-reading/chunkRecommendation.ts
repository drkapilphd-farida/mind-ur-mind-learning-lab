// Chunk Recommendation™ — post-session coach message for Chunk Reading.
// Deterministic functions only. Sprint AI Mentor™ will replace only the
// message strings without changing function signatures or callers.

import type { DifficultyTier } from '@/types/exercise-engine'
import { getChunkProfile, chunkSizeLabel } from './chunkDifficulty'

export type ChunkRecommendation = {
  accuracyMessage: string
  progressMessage: string
  nextChunkSize: number
  nextTier: DifficultyTier
  coachTip: string
}

export function buildChunkRecommendation(input: {
  accuracyPercent: number
  wordsPerChunk: number
  currentTier: DifficultyTier
  nextTier: DifficultyTier
  promoted: boolean
  recovered: boolean
}): ChunkRecommendation {
  const { accuracyPercent, wordsPerChunk, nextTier, promoted, recovered } = input
  const nextProfile = getChunkProfile(nextTier)

  const accuracyMessage =
    accuracyPercent >= 90 ? 'Excellent chunk recognition — your visual span is expanding.'
    : accuracyPercent >= 75 ? 'Strong performance. Your brain is adapting to wider reading patterns.'
    : accuracyPercent >= 60 ? 'Good start. Consistency builds the chunk recognition reflex.'
    : 'Keep practicing — the multi-word perception habit takes time to form.'

  const progressMessage = promoted
    ? `Advancing to ${chunkSizeLabel(nextProfile.wordsPerChunk)} — your visual span is growing.`
    : recovered
      ? `Stepping back to ${chunkSizeLabel(nextProfile.wordsPerChunk)} to strengthen foundation.`
      : `Maintaining ${chunkSizeLabel(wordsPerChunk)} — steady consolidation.`

  const coachTips: string[] = [
    'Let your eyes rest at the centre of each chunk — don\'t trace individual words.',
    'Relax your gaze. Soft focus allows peripheral words to enter your awareness.',
    'Trust the pattern. Your brain recognises word groups faster than you consciously read.',
    'Breathe steadily. Tension narrows the visual field — calm eyes see more.',
    'Try not to say the words internally. Silence the inner voice and let images form.',
    `${wordsPerChunk} words per fixation means ${Math.ceil(200 / wordsPerChunk)} fixations for a 200-word page — focus on that.`,
  ]

  const tipIdx = Math.floor(accuracyPercent / 17) % coachTips.length
  const coachTip = coachTips[tipIdx] ?? coachTips[0]!

  return {
    accuracyMessage,
    progressMessage,
    nextChunkSize: nextProfile.wordsPerChunk,
    nextTier,
    coachTip,
  }
}
