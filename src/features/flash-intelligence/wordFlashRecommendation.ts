// Word Flash™ Recommendation — post-mission brain coaching copy.
// Deterministic functions only, matching chunkRecommendation.ts's pattern
// so a future AI Mentor™ sprint can replace message strings without
// touching callers.
//
// Vocabulary follows the locked Flash Intelligence Pack™ language system:
// premium brain-coaching phrasing (Visual Recognition Improved, Excellent
// Brain Speed, Outstanding Focus, Elite Performance, ...), never quiz/test
// words. Every message is still derived from the real accuracy/speed
// numbers — the language changed, not the honesty behind it.

import type { DifficultyTier } from '@/types/exercise-engine'
import { wordFlashUiLevel, wordFlashPaceDescriptor } from './wordFlashDifficulty'

export type WordFlashRecommendation = {
  accuracyMessage: string
  progressMessage: string
  wpmMessage: string
  coachTip: string
  // A fuller, 2-3 sentence AI Coach paragraph for the redesigned Mission
  // Complete screen — evaluative opener, a consistency observation, and a
  // forward-looking readiness statement, derived from the real
  // accuracy/consistency numbers.
  coachParagraph: string
}

export function buildWordFlashRecommendation(input: {
  accuracyPercent: number
  estimatedWpmGrowth: number | null
  currentTier: DifficultyTier
  nextTier: DifficultyTier
  promoted: boolean
  recovered: boolean
}): WordFlashRecommendation {
  const { accuracyPercent, estimatedWpmGrowth, nextTier, promoted, recovered } = input

  const accuracyMessage =
    accuracyPercent === 100 ? 'Perfect Recognition — every word locked in instantly.'
    : accuracyPercent >= 90 ? 'Elite Performance — your reading brain is operating at its peak.'
    : accuracyPercent >= 75 ? 'Excellent Brain Speed — Visual Recognition Improved this mission.'
    : accuracyPercent >= 60 ? 'Outstanding Focus — Recognition Accuracy Increased with every rep.'
    : 'Brain Warming Up — Fast Detection takes a few missions to build.'

  const progressMessage = promoted
    ? `Advancing to ${wordFlashUiLevel(nextTier)} — ${wordFlashPaceDescriptor(nextTier)} pace. Your Mastery Progress is climbing.`
    : recovered
      ? `Stepping back to ${wordFlashUiLevel(nextTier)} to strengthen Recognition Mastery before pushing further.`
      : `Holding steady at ${wordFlashUiLevel(nextTier)} — Consistency is how Reading Readiness builds.`

  const wpmMessage =
    estimatedWpmGrowth === null
      ? 'Establishing your Reading Potential baseline — next mission reveals your first Estimated Reading Growth.'
      : estimatedWpmGrowth > 0
        ? `Estimated Reading Growth: up ${estimatedWpmGrowth} words/min since your last mission.`
        : estimatedWpmGrowth < 0
          ? 'Recognition Speed dipped slightly this mission — normal day-to-day variation, not a setback.'
          : 'Recognition Speed held steady from your last mission.'

  const coachTips: string[] = [
    'Let the word register as one whole shape — resist reading it letter by letter.',
    'Relax your gaze. Tension narrows the visual field before the word even appears.',
    'Trust your first impression. Your Reading Brain recognises common words faster than you consciously process them.',
    'Breathe steadily between flashes — a calm state sharpens instant recognition.',
    'Try not to say the word internally. Let it register as an image, not a sound.',
  ]
  const tipIdx = Math.floor(accuracyPercent / 20) % coachTips.length
  const coachTip = coachTips[tipIdx] ?? coachTips[0]!

  const opener =
    accuracyPercent >= 90 ? 'Excellent work.'
    : accuracyPercent >= 75 ? 'Strong mission.'
    : accuracyPercent >= 60 ? 'Solid progress.'
    : 'Good effort.'
  const consistencyLine =
    accuracyPercent >= 85
      ? 'Your word recognition remained consistent throughout the mission.'
      : accuracyPercent >= 60
        ? 'Your recognition speed held steady across most of the mission.'
        : 'Your recognition speed is still finding its rhythm — that steadies with repetition.'
  const readinessLine = promoted
    ? `You are now ready for longer recognition patterns at ${wordFlashUiLevel(nextTier)}.`
    : recovered
      ? 'A short step back now builds the foundation for faster recognition later.'
      : 'Keep this pace and the next level will feel within reach.'
  const coachParagraph = `${opener} ${consistencyLine} ${readinessLine}`

  return { accuracyMessage, progressMessage, wpmMessage, coachTip, coachParagraph }
}
