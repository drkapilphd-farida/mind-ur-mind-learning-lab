// Visual Intelligence Lab™ — Visual Analytics™, Sprint 10D.
// Every score below is a plain, disclosed weighted blend of the real
// ordinal/measured answers the student just gave (via
// imageFixationReflection.ts's ratio maps, or a real measured duration)
// plus real completed-level/duration data already computed elsewhere in
// this feature — mirrors the exact convention used by
// computeFocusScore/computeTratakPersistenceScore/computeTratakFocusScore.
// No fabricated measurement, no eye tracking, no invented AI signal.

import {
  AFTER_IMAGE_CLARITY_RATIO,
  AFTER_IMAGE_DURATION_RATIO,
  CENTER_FOCUS_EASE_RATIO,
  GAZE_STABILITY_RATIO,
  type AfterImageClarity,
  type AfterImageDuration,
  type CenterFocusEase,
  type GazeStability,
} from './imageFixationReflection'

export type VisualAnalyticsInput = {
  // Sprint 10F enhancement: null for missions whose simplified reflection
  // no longer asks this (Image Persistence Challenge™, Candle Tratak™).
  // Mandala Tratak™ always supplies a real value, so its scores are
  // byte-for-byte unchanged.
  gazeStability: GazeStability | null
  afterImageClarity: AfterImageClarity
  afterImageDuration: AfterImageDuration
  centerFocusEase: CenterFocusEase | null
  completedLevelsCount: number
  totalLevelsCount: number
  totalDurationSeconds: number
  // Sprint 10F enhancement: a real, precisely-measured 0-1 duration ratio
  // from the 2-tap timer — when present, used instead of the coarser
  // 4-tier bucket ratio for more precise, still 100%-real scoring. null/
  // undefined for Mandala Tratak™, which only ever self-reports the bucket.
  measuredAfterImageDurationRatio?: number | null
}

export type VisualAnalytics = {
  fixationStability: number
  afterImageAwareness: number
  observationQuality: number
  visualEndurance: number
  sessionConfidence: number
}

export function computeVisualAnalytics(input: VisualAnalyticsInput): VisualAnalytics {
  const clarityRatio = AFTER_IMAGE_CLARITY_RATIO[input.afterImageClarity]
  const durationRatio = input.measuredAfterImageDurationRatio ?? AFTER_IMAGE_DURATION_RATIO[input.afterImageDuration]
  const gazeRatio = input.gazeStability !== null ? GAZE_STABILITY_RATIO[input.gazeStability] : null
  const centerRatio = input.centerFocusEase !== null ? CENTER_FOCUS_EASE_RATIO[input.centerFocusEase] : null

  // Fixation Stability™ — when real self-report is available (Mandala
  // Tratak™, unchanged): 60% gaze stability + 40% how easy the center
  // remained to focus on. When the simplified flow doesn't ask these
  // (Image Persistence Challenge™, Candle Tratak™), honestly re-derived
  // from the real measured after-image duration ratio alone — a steadier
  // fixation tends to sustain the afterimage longer. Never fabricated:
  // always a real collected input, just a different real input.
  const fixationStability =
    gazeRatio !== null && centerRatio !== null ? Math.round(100 * (0.6 * gazeRatio + 0.4 * centerRatio)) : Math.round(100 * durationRatio)

  // After-Image Awareness™ — did the student notice the effect at all.
  const afterImageAwareness = Math.round(100 * clarityRatio)

  // Observation Quality™ — how good AND how sustained the observed effect
  // was, distinct from mere awareness by weighing duration equally.
  const observationQuality = Math.round(100 * (0.5 * clarityRatio + 0.5 * durationRatio))

  // Visual Endurance™ — real cumulative practice, not this session's
  // self-report: 60% mission breadth (levels completed so far) + 40%
  // lifetime practice time, saturating at 5 minutes.
  const visualEndurance = Math.round(
    100 *
      (0.6 * (input.totalLevelsCount > 0 ? input.completedLevelsCount / input.totalLevelsCount : 0) +
        0.4 * Math.min(input.totalDurationSeconds / 300, 1)),
  )

  // Session Confidence™ — average of whichever real ratios were actually
  // collected this session (clarity + duration always; gaze/center only
  // when the mission's flow asks for them).
  const availableRatios = [clarityRatio, durationRatio, gazeRatio, centerRatio].filter((ratio): ratio is number => ratio !== null)
  const sessionConfidence = Math.round(100 * (availableRatios.reduce((sum, ratio) => sum + ratio, 0) / availableRatios.length))

  return { fixationStability, afterImageAwareness, observationQuality, visualEndurance, sessionConfidence }
}
