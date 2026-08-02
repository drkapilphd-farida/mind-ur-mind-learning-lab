// Symbol Flash™ Recommendation — post-mission brain coaching copy. The AI
// Coach paragraph specifically touches Visual Recognition, Eye Speed,
// Fixation, and Reading Benefit per the mission brief — the same
// deterministic, real-numbers-only pattern every other mission uses.

import type { DifficultyTier } from '@/types/exercise-engine'
import { symbolFlashUiLevel, symbolFlashPaceDescriptor } from './symbolFlashDifficulty'

export type SymbolFlashRecommendation = {
  accuracyMessage: string
  progressMessage: string
  coachParagraph: string
}

export function computeReadingSpeedBenefit(accuracyPercent: number, growth: number | null): string {
  if (accuracyPercent >= 85 && growth !== null && growth > 0) return 'Strong Transfer'
  if (accuracyPercent >= 85) return 'Building Transfer'
  if (accuracyPercent >= 70) return 'Emerging Transfer'
  return 'Early Stage'
}

export function buildSymbolFlashRecommendation(input: {
  accuracyPercent: number
  currentTier: DifficultyTier
  nextTier: DifficultyTier
  promoted: boolean
  recovered: boolean
}): SymbolFlashRecommendation {
  const { accuracyPercent, nextTier, promoted, recovered } = input

  const accuracyMessage =
    accuracyPercent === 100 ? 'Perfect Recognition — every symbol locked in instantly.'
    : accuracyPercent >= 90 ? 'Elite Performance — your visual system is operating at its peak.'
    : accuracyPercent >= 75 ? 'Fast Detection — Visual Recognition Improved this mission.'
    : accuracyPercent >= 60 ? 'Outstanding Focus — Recognition Accuracy Increased with every rep.'
    : 'Brain Warming Up — instant symbol recognition takes a few missions to build.'

  const progressMessage = promoted
    ? `Advancing to ${symbolFlashUiLevel(nextTier)} — ${symbolFlashPaceDescriptor(nextTier)} pace. Your eye speed is climbing.`
    : recovered
      ? `Stepping back to ${symbolFlashUiLevel(nextTier)} to strengthen recognition accuracy before pushing further.`
      : `Holding steady at ${symbolFlashUiLevel(nextTier)} — Consistency is how fixation efficiency builds.`

  const opener =
    accuracyPercent >= 90 ? 'Excellent work.'
    : accuracyPercent >= 75 ? 'Strong mission.'
    : accuracyPercent >= 60 ? 'Solid progress.'
    : 'Good effort.'

  // Touches Visual Recognition, Eye Speed, and Fixation explicitly, per
  // the mission brief — grounded in the real accuracy figure, not filler.
  const visualSystemLine =
    accuracyPercent >= 85
      ? 'Your visual recognition and eye fixation stayed sharp and consistent throughout.'
      : accuracyPercent >= 60
        ? 'Your eye speed held steady, with fixation efficiency improving as the mission went on.'
        : 'Your fixation is still settling into rhythm — that sharpens with repetition.'

  const readingBenefitLine = promoted
    ? `This level of instant perception is exactly what faster reading is built on — you are ready for ${symbolFlashUiLevel(nextTier)}.`
    : recovered
      ? 'A short step back now builds the fixation habits real reading speed depends on.'
      : 'Every fast, accurate glance here is a rep for the same skill real reading uses.'

  const coachParagraph = `${opener} ${visualSystemLine} ${readingBenefitLine}`

  return { accuracyMessage, progressMessage, coachParagraph }
}
