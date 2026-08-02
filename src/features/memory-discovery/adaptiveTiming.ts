import { DIGIT_SPAN_MAX_ADAPTIVE_MULTIPLIER, DIGIT_SPAN_MIN_ADAPTIVE_MULTIPLIER, MAX_ADAPTIVE_MULTIPLIER, MIN_ADAPTIVE_MULTIPLIER } from './memoryTimingConfig'

// Memory Discovery™ Adaptive Timing Engine™ — Sprint-2.1.
//
// "Invisible AI™ — users should never see Timing Adjustment... Difficulty
// Adjustment... everything should happen silently." Two real, small,
// clamped multipliers — never exposed, never a fabricated percentage in
// the UI, only ever applied to a real observation duration underneath.

function clamp(value: number): number {
  return Math.min(MAX_ADAPTIVE_MULTIPLIER, Math.max(MIN_ADAPTIVE_MULTIPLIER, value))
}

// FIX-03 — Reading-Speed Awareness. A real WPM near this reference reads
// as "typical" (no adjustment); a real, meaningfully faster reader gets
// slightly shorter observation windows, a real, meaningfully slower
// reader gets slightly longer ones — clamped to the same shared ±20%
// band FIX-04's own performance adjustment uses. `null` (Reading
// Discovery data unavailable) always resolves to 1 — the untouched
// default timing table.
const REFERENCE_WPM = 200
const READING_SPEED_SENSITIVITY = 0.5

export function computeReadingSpeedMultiplier(lastReadingWpm: number | null): number {
  if (lastReadingWpm === null || lastReadingWpm <= 0) return 1
  const deviation = (lastReadingWpm - REFERENCE_WPM) / REFERENCE_WPM
  return clamp(1 - deviation * READING_SPEED_SENSITIVITY)
}

// FIX-04 — Performance-Based Timing. Nudges a running real multiplier a
// small, fixed step toward faster after a real correct answer, toward
// slower after a real miss — several real correct answers in a row
// naturally compound into the full real reduction (and vice versa),
// without a separate streak-counter data structure. "Never create
// dramatic jumps" — the step itself is small; only the shared ±20% clamp
// bounds the cumulative effect.
const PERFORMANCE_STEP = 0.05

export function nextPerformanceMultiplier(currentMultiplier: number, wasCorrect: boolean): number {
  return clamp(wasCorrect ? currentMultiplier - PERFORMANCE_STEP : currentMultiplier + PERFORMANCE_STEP)
}

// Number Memory Exposure Engine™ (Sprint-4.1) FIX-08 — bounds ONLY Digit
// Span's own final combined multiplier (session-wide Reading-Speed
// Awareness × its own in-session Performance-Based step) to a real ±15%,
// tighter than the shared ±20% band above. The production timing table
// (`DIGIT_SPAN_OBSERVATION_MS`) is always the real baseline this clamp
// applies on top of — never the other way around.
export function clampDigitSpanMultiplier(value: number): number {
  return Math.min(DIGIT_SPAN_MAX_ADAPTIVE_MULTIPLIER, Math.max(DIGIT_SPAN_MIN_ADAPTIVE_MULTIPLIER, value))
}
