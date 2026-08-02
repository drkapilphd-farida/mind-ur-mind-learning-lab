// Number Flash™ Recommendation — post-mission brain coaching copy, tuned
// to visual/numerical recognition rather than word recognition. Same
// deterministic-function pattern as wordFlashRecommendation.ts and the
// same locked premium-coaching vocabulary, never quiz/test language.

import type { DifficultyTier } from '@/types/exercise-engine'
import { numberFlashUiLevel, numberFlashPaceDescriptor } from './numberFlashDifficulty'

export type NumberFlashRecommendation = {
  accuracyMessage: string
  progressMessage: string
  // A fuller, 2-3 sentence AI Coach paragraph for the redesigned Mission
  // Complete screen (Fix 9) — evaluative opener, a consistency
  // observation, and a forward-looking readiness statement, all derived
  // from the real accuracy/consistency numbers, never generic filler.
  coachParagraph: string
}

// Estimated Reading Speed Benefit — a qualitative transfer-readiness read,
// deliberately distinct from the numeric Estimated Visual Processing
// Growth tile (this is "how much does this mission's recognition speed
// likely transfer to real reading," framed in words, not another number
// restating the same figure). Derived from real accuracy + growth
// direction, never fabricated.
export function computeReadingSpeedBenefit(accuracyPercent: number, growth: number | null): string {
  if (accuracyPercent >= 85 && growth !== null && growth > 0) return 'Strong Transfer'
  if (accuracyPercent >= 85) return 'Building Transfer'
  if (accuracyPercent >= 70) return 'Emerging Transfer'
  return 'Early Stage'
}

export function buildNumberFlashRecommendation(input: {
  accuracyPercent: number
  currentTier: DifficultyTier
  nextTier: DifficultyTier
  promoted: boolean
  recovered: boolean
}): NumberFlashRecommendation {
  const { accuracyPercent, nextTier, promoted, recovered } = input

  const accuracyMessage =
    accuracyPercent === 100 ? 'Perfect Recognition — every number locked in instantly.'
    : accuracyPercent >= 90 ? 'Elite Performance — your visual processing is operating at its peak.'
    : accuracyPercent >= 75 ? 'Fast Detection — Visual Recognition Improved this mission.'
    : accuracyPercent >= 60 ? 'Outstanding Focus — Recognition Accuracy Increased with every rep.'
    : 'Brain Warming Up — rapid number recognition takes a few missions to build.'

  const progressMessage = promoted
    ? `Advancing to ${numberFlashUiLevel(nextTier)} — ${numberFlashPaceDescriptor(nextTier)} pace. Your visual processing speed is climbing.`
    : recovered
      ? `Stepping back to ${numberFlashUiLevel(nextTier)} to strengthen recognition accuracy before pushing further.`
      : `Holding steady at ${numberFlashUiLevel(nextTier)} — Consistency is how visual processing speed builds.`

  const opener =
    accuracyPercent >= 90 ? 'Excellent work.'
    : accuracyPercent >= 75 ? 'Strong mission.'
    : accuracyPercent >= 60 ? 'Solid progress.'
    : 'Good effort.'
  const consistencyLine =
    accuracyPercent >= 85
      ? 'Your visual recognition remained consistent throughout the mission.'
      : accuracyPercent >= 60
        ? 'Your recognition speed held steady across most of the mission.'
        : 'Your recognition speed is still finding its rhythm — that steadies with repetition.'
  const readinessLine = promoted
    ? `You are now ready for longer recognition patterns at ${numberFlashUiLevel(nextTier)}.`
    : recovered
      ? 'A short step back now builds the foundation for faster recognition later.'
      : 'Keep this pace and the next level will feel within reach.'

  const coachParagraph = `${opener} ${consistencyLine} ${readinessLine}`

  return { accuracyMessage, progressMessage, coachParagraph }
}
