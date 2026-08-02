// Visual Intelligence Lab™ — Intelligent Focus Analyzer™, Sprint 10D.
// Generic, mission-agnostic reflection shape for any "observe an image,
// close your eyes, notice the after-image" mission — reused verbatim by
// Mandala Tratak™ today and, later, Color/Nature/Portrait/Candle
// Persistence without any of this file changing. Self-report only, never
// scored as right/wrong — the ratios below exist purely to turn an honest
// ordinal choice into a 0-1 input for Visual Analytics formulas.

export type GazeStability = 'very-stable' | 'mostly-stable' | 'frequently-drifted' | 'could-not-maintain'
export type AfterImageClarity = 'very-clear' | 'moderate' | 'faint' | 'none'
export type AfterImageDuration = 'more-than-10s' | '5-10s' | 'less-than-5s' | 'not-observed'
export type CenterFocusEase = 'yes' | 'sometimes' | 'difficult'

export type ImageFixationAnalyzerAnswers = {
  // Sprint 10F enhancement: nullable — Image Persistence Challenge™'s and
  // Candle Tratak™'s simplified reflection no longer ask these 2
  // questions. Mandala Tratak™'s screen still always supplies both.
  gazeStability: GazeStability | null
  afterImageClarity: AfterImageClarity
  afterImageDuration: AfterImageDuration
  centerFocusEase: CenterFocusEase | null
  notes: string | null
}

export const GAZE_STABILITY_RATIO: Record<GazeStability, number> = {
  'very-stable': 1,
  'mostly-stable': 0.66,
  'frequently-drifted': 0.33,
  'could-not-maintain': 0,
}

export const AFTER_IMAGE_CLARITY_RATIO: Record<AfterImageClarity, number> = {
  'very-clear': 1,
  moderate: 0.66,
  faint: 0.33,
  none: 0,
}

export const AFTER_IMAGE_DURATION_RATIO: Record<AfterImageDuration, number> = {
  'more-than-10s': 1,
  '5-10s': 0.66,
  'less-than-5s': 0.33,
  'not-observed': 0,
}

export const CENTER_FOCUS_EASE_RATIO: Record<CenterFocusEase, number> = {
  yes: 1,
  sometimes: 0.5,
  difficult: 0,
}

export const GAZE_STABILITY_OPTIONS: readonly { value: GazeStability; label: string }[] = [
  { value: 'very-stable', label: 'Very Stable' },
  { value: 'mostly-stable', label: 'Mostly Stable' },
  { value: 'frequently-drifted', label: 'Frequently Drifted' },
  { value: 'could-not-maintain', label: 'Could Not Maintain Focus' },
]

export const AFTER_IMAGE_CLARITY_OPTIONS: readonly { value: AfterImageClarity; label: string }[] = [
  { value: 'very-clear', label: 'Very Clear' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'faint', label: 'Faint' },
  { value: 'none', label: 'None' },
]

export const AFTER_IMAGE_DURATION_OPTIONS: readonly { value: AfterImageDuration; label: string }[] = [
  { value: 'more-than-10s', label: 'More than 10 seconds' },
  { value: '5-10s', label: '5–10 seconds' },
  { value: 'less-than-5s', label: 'Less than 5 seconds' },
  { value: 'not-observed', label: 'Not observed' },
]

export const CENTER_FOCUS_EASE_OPTIONS: readonly { value: CenterFocusEase; label: string }[] = [
  { value: 'yes', label: 'Yes' },
  { value: 'sometimes', label: 'Sometimes' },
  { value: 'difficult', label: 'Difficult' },
]

// Sprint 10F enhancement: Image Persistence Challenge™/Candle Tratak™ now
// measure a REAL after-image duration (2-tap timer) instead of asking this
// as a question. This derives the existing 4-tier bucket honestly from
// that real measurement, purely additive — Mandala's own flow never calls
// this, it still asks the question directly.
const AFTER_IMAGE_DURATION_RATIO_CAP_SECONDS = 15

export function secondsToAfterImageDurationBucket(seconds: number): AfterImageDuration {
  if (seconds > 10) return 'more-than-10s'
  if (seconds >= 5) return '5-10s'
  if (seconds > 0) return 'less-than-5s'
  return 'not-observed'
}

// A continuous 0-1 ratio from the real measured seconds — more precise
// than the 4-tier bucket ratio above, used for scoring when a real
// measurement is available.
export function computeAfterImageDurationRatioFromSeconds(seconds: number): number {
  return Math.min(Math.max(seconds, 0) / AFTER_IMAGE_DURATION_RATIO_CAP_SECONDS, 1)
}
