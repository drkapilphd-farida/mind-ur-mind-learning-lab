import type { AdaptiveTrend } from '@/features/discover-learning-potential/types'

export type ProgressivePaceInput = {
  itemIndex: number
  totalItems: number
  // The real previous item's real dwell time and its own real target
  // duration — `null` for the very first item, when there's nothing yet
  // to compare against.
  previousDwellMs: number | null
  previousBaseDurationMs: number | null
  trend: AdaptiveTrend
}

export type ProgressivePaceResult = {
  multiplier: number
  hesitationDetected: boolean
}

// Progressive Pace™ — "Warm-up → Comfort → Slight Challenge → Adaptive
// Challenge → Finish... the increase must feel natural, never sudden,
// never fixed." A smooth (smoothstep-eased, not linear) ramp from a
// slower warm-up multiplier down to a faster adaptive-challenge
// multiplier across the real item sequence — never a discrete jump.
const WARMUP_MULTIPLIER = 1.15
const ADAPTIVE_CHALLENGE_MULTIPLIER = 0.8

// "If the AI detects hesitation, pause the progression or slightly
// reduce the pace." A real, disclosed threshold: taking meaningfully
// longer than an item's own real target duration (40%+) reads as
// genuine hesitation, not just normal variation.
const HESITATION_RATIO_THRESHOLD = 1.4

// Real Adaptive Runtime™ — folds in the broader, multi-signal
// `AdaptiveTrend` (`estimateAdaptiveChallenge`, Sprint-1 Foundation) as a
// second, smaller real adjustment on top of the ramp — "continuously
// adjust... based on live performance," not just this one item's own
// dwell time.
const TREND_MULTIPLIER: Record<AdaptiveTrend, number> = { improving: 0.95, stable: 1, declining: 1.1 }

function smoothstep(t: number): number {
  return t * t * (3 - 2 * t)
}

// Reading Runtime Corrections™ (Sprint-2 Part-2A) — real, deterministic,
// unit-tested pacing logic. Never fabricates a "correct" pace; every
// input is a real, already-measured value from this session's own
// runtime. Content selection is never touched here — only how long the
// next real item stays on screen.
export function computeProgressivePaceMultiplier(input: ProgressivePaceInput): ProgressivePaceResult {
  const progress = input.totalItems <= 1 ? 1 : input.itemIndex / (input.totalItems - 1)
  const rampMultiplier = WARMUP_MULTIPLIER + (ADAPTIVE_CHALLENGE_MULTIPLIER - WARMUP_MULTIPLIER) * smoothstep(Math.min(1, Math.max(0, progress)))

  const hesitationDetected =
    input.previousDwellMs !== null &&
    input.previousBaseDurationMs !== null &&
    input.previousBaseDurationMs > 0 &&
    input.previousDwellMs / input.previousBaseDurationMs > HESITATION_RATIO_THRESHOLD

  // Hesitation pauses the ramp — never lets it keep accelerating past a
  // comfortable pace — and is treated the same as a real "declining" trend.
  const baseMultiplier = hesitationDetected ? Math.max(rampMultiplier, 1) : rampMultiplier
  const trendMultiplier = hesitationDetected ? TREND_MULTIPLIER.declining : TREND_MULTIPLIER[input.trend]

  return { multiplier: baseMultiplier * trendMultiplier, hesitationDetected }
}
