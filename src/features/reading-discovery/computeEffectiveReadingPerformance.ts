import { clampToRealisticWpm } from './clampToRealisticWpm'

export type ReadingIntelligenceInputs = {
  // The real, already time-based measured speed (Reading Time /
  // Completion Time already live inside this number — see
  // `useContinuousSprintRuntime`'s own rolling-window WPM).
  rawWpm: number | null
  // Real fraction (0-1) of this session's real comprehension questions
  // (Paragraph Sprint + Reading Understanding) answered correctly —
  // Comprehension Score + Question Accuracy, combined. `null` when no
  // real questions were answered this session.
  comprehensionAccuracy: number | null
  // Real fraction (0-1) of this session's real stimulus items that
  // showed real detected hesitation — Hesitation Pattern.
  hesitationRate: number
  // Real 0-1 score — Reading Rhythm + Reading Consistency, combined
  // (both describe the same real underlying signal: how steady real
  // item-to-item dwell time was, not two independently-measurable
  // things). 1 = perfectly steady pace, 0 = highly erratic.
  dwellConsistency: number
}

// Sprint-2.6B FIX-16 (CRITICAL) — "Never calculate the final reading
// speed using reading time alone... A user who reads extremely fast but
// answers poorly should NOT receive an extremely high reading score."
// Effective Reading Speed = real measured WPM, modulated by real
// comprehension, hesitation, and consistency signals — never inflated,
// only ever pulled toward a more honest, believable number. Comprehension
// carries the largest real weight (up to a 40% swing) because
// understanding, not raw exposure speed, is what "effective reading"
// means; hesitation and consistency each contribute a smaller, real
// adjustment. Every multiplier is floored so a rough session still
// produces a real, encouraging number — never zero, never punitive.
const MIN_COMPREHENSION_MULTIPLIER = 0.6
const MIN_HESITATION_MULTIPLIER = 0.8
const MIN_CONSISTENCY_MULTIPLIER = 0.85

export function computeEffectiveReadingPerformance(inputs: ReadingIntelligenceInputs): number | null {
  if (inputs.rawWpm === null) return null

  const comprehensionMultiplier = inputs.comprehensionAccuracy === null ? 1 : MIN_COMPREHENSION_MULTIPLIER + (1 - MIN_COMPREHENSION_MULTIPLIER) * inputs.comprehensionAccuracy
  const hesitationMultiplier = 1 - (1 - MIN_HESITATION_MULTIPLIER) * Math.min(1, Math.max(0, inputs.hesitationRate))
  const consistencyMultiplier = MIN_CONSISTENCY_MULTIPLIER + (1 - MIN_CONSISTENCY_MULTIPLIER) * Math.min(1, Math.max(0, inputs.dwellConsistency))

  const effective = inputs.rawWpm * comprehensionMultiplier * hesitationMultiplier * consistencyMultiplier
  return clampToRealisticWpm(Math.round(effective))
}

// Reading Rhythm / Reading Consistency — a real coefficient-of-variation
// over real item-to-item dwell times (lower variation = steadier,
// higher score). Fewer than 2 real samples can't describe a rhythm, so
// it's treated as neutral (1) rather than fabricated.
export function computeDwellConsistency(dwellTimesMs: readonly number[]): number {
  if (dwellTimesMs.length < 2) return 1
  const mean = dwellTimesMs.reduce((sum, value) => sum + value, 0) / dwellTimesMs.length
  if (mean <= 0) return 1
  const variance = dwellTimesMs.reduce((sum, value) => sum + (value - mean) ** 2, 0) / dwellTimesMs.length
  const coefficientOfVariation = Math.sqrt(variance) / mean
  return Math.min(1, Math.max(0, 1 - coefficientOfVariation))
}
