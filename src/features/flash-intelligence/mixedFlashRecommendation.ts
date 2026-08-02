// Mixed Flash™ Recommendation — the AI Coach explains WHICH stimulus type
// needs more practice, using the real per-type accuracy breakdown
// (mixedFlashEngine.ts's findWeakestStimulusType/findStrongestStimulusType)
// — never a generic message. Same deterministic, real-numbers-only
// pattern every other mission's coach uses.

import type { DifficultyTier } from '@/types/exercise-engine'
import { mixedFlashUiLevel, mixedFlashPaceDescriptor } from './mixedFlashDifficulty'
import type { MixedFlashStimulusType, StimulusTypeBreakdown } from './mixedFlashEngine'

export type MixedFlashRecommendation = {
  accuracyMessage: string
  progressMessage: string
  coachParagraph: string
}

const TYPE_LABEL: Record<MixedFlashStimulusType, string> = {
  word: 'word',
  number: 'number',
  symbol: 'symbol',
}

export function buildMixedFlashRecommendation(input: {
  accuracyPercent: number
  currentTier: DifficultyTier
  nextTier: DifficultyTier
  promoted: boolean
  recovered: boolean
  breakdown: StimulusTypeBreakdown
  weakestType: MixedFlashStimulusType | null
  strongestType: MixedFlashStimulusType | null
}): MixedFlashRecommendation {
  const { accuracyPercent, nextTier, promoted, recovered, breakdown, weakestType, strongestType } = input

  const accuracyMessage =
    accuracyPercent === 100 ? 'Perfect Recognition — every stimulus type locked in instantly.'
    : accuracyPercent >= 90 ? 'Elite Performance — your cognitive flexibility is operating at its peak.'
    : accuracyPercent >= 75 ? 'Fast Detection — Recognition Switching Improved this mission.'
    : accuracyPercent >= 60 ? 'Outstanding Focus — Attention Control Increased with every rep.'
    : 'Brain Warming Up — switching between stimulus types takes a few missions to build.'

  const progressMessage = promoted
    ? `Advancing to ${mixedFlashUiLevel(nextTier)} — ${mixedFlashPaceDescriptor(nextTier)} pace. Your recognition switching is climbing.`
    : recovered
      ? `Stepping back to ${mixedFlashUiLevel(nextTier)} to strengthen attention control before pushing further.`
      : `Holding steady at ${mixedFlashUiLevel(nextTier)} — Consistency is how cognitive flexibility builds.`

  const opener =
    accuracyPercent >= 90 ? 'Excellent work.'
    : accuracyPercent >= 75 ? 'Strong mission.'
    : accuracyPercent >= 60 ? 'Solid progress.'
    : 'Good effort.'

  // The specific, real-numbers-driven callout — "which stimulus type
  // needs improvement" per the mission brief's own example. Only calls
  // out a weak type when there's an actual gap: findWeakestStimulusType
  // always returns SOME type once 2+ types have enough samples, even when
  // every type scored equally well (a tie-break artifact of iteration
  // order, not a real weakness) — found live, where a 100%-across-the-
  // board session still said "Word recognition needs more practice."
  // Requiring both a minimum shortfall and an actual gap versus the
  // strongest type avoids that false callout.
  const MEANINGFUL_GAP_POINTS = 15
  const MEANINGFUL_SHORTFALL_PERCENT = 80

  let typeCallout: string
  const weakStats = weakestType !== null ? breakdown[weakestType] : null
  const strongStats = strongestType !== null ? breakdown[strongestType] : null
  const weakAccuracy = weakStats !== null && weakStats.total > 0 ? (weakStats.correct / weakStats.total) * 100 : 100
  const strongAccuracy = strongStats !== null && strongStats.total > 0 ? (strongStats.correct / strongStats.total) * 100 : 0
  const hasMeaningfulGap = weakestType !== null
    && weakAccuracy < MEANINGFUL_SHORTFALL_PERCENT
    && (strongestType === weakestType || strongAccuracy - weakAccuracy >= MEANINGFUL_GAP_POINTS)

  if (!hasMeaningfulGap) {
    typeCallout = 'Every stimulus type held up well this mission — no single type needs extra focus right now.'
  } else if (strongestType !== null && strongestType !== weakestType && strongStats !== null) {
    typeCallout = `Excellent ${TYPE_LABEL[strongestType]} recognition (${strongStats.correct}/${strongStats.total}). `
      + `${TYPE_LABEL[weakestType].charAt(0).toUpperCase()}${TYPE_LABEL[weakestType].slice(1)} recognition needs more practice (${weakStats!.correct}/${weakStats!.total}).`
  } else {
    typeCallout = `${TYPE_LABEL[weakestType].charAt(0).toUpperCase()}${TYPE_LABEL[weakestType].slice(1)} recognition needs more practice (${weakStats!.correct}/${weakStats!.total}).`
  }

  const readinessLine = promoted
    ? `This level of switching is exactly what real reading demands — you are ready for ${mixedFlashUiLevel(nextTier)}.`
    : recovered
      ? 'A short step back now builds the attention control real reading depends on.'
      : 'Keep mixing stimulus types and the next level will feel within reach.'

  const coachParagraph = `${opener} ${typeCallout} ${readinessLine}`

  return { accuracyMessage, progressMessage, coachParagraph }
}
