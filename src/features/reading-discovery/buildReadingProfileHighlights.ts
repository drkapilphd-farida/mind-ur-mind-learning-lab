import type { AdaptiveTrend } from '@/features/discover-learning-potential/types'

export type ReadingProfileHighlights = {
  // Sprint-2.6 FIX-02 — the Result screen's new hero. A real identity,
  // never a number, and never negative ("Do NOT use negative labels...
  // make users curious about themselves").
  profileLabel: string
  // Sprint-2.6B FIX-26 — "Reading Efficiency," ≤6 words, combining real
  // speed AND real comprehension into one meaningful insight (e.g.
  // "Excellent Accuracy. Increase Rhythm.").
  efficiencyLine: string
  // Sprint-2.6B FIX-27 — exactly ONE real, encouraging next opportunity,
  // intelligently chosen from every real available signal (comprehension
  // first, since understanding gaps are the highest-impact real finding).
  biggestImprovement: string
}

// A real, disclosed threshold — a quarter or more of this session's real
// items showing real hesitation reads as a genuine, honest pattern worth
// naming, not an isolated pause.
const HIGH_HESITATION_RATE = 0.25
const LOW_HESITATION_RATE = 0.15

// Sprint-2.7 FIX-26/FIX-27 — real, disclosed comprehension-accuracy
// bands. "Low" reads as a genuine, honest understanding gap worth
// naming as the session's single highest-impact opportunity; "high"
// reads as a genuine strength worth naming in the Efficiency line.
const LOW_COMPREHENSION_ACCURACY = 0.5
const HIGH_COMPREHENSION_ACCURACY = 0.8

function pickProfileLabel(trend: AdaptiveTrend, hesitationRate: number): string {
  if (trend === 'improving') return 'Developing Speed Reader'
  if (hesitationRate >= HIGH_HESITATION_RATE) return trend === 'declining' ? 'Emerging Chunk Reader' : 'Careful Reader'
  if (hesitationRate < LOW_HESITATION_RATE) return 'Consistent Reader'
  return trend === 'declining' ? 'Growing Reader' : 'Focused Reader'
}

// Sprint-2.7 FIX-26 — "combines speed and comprehension into one
// meaningful insight." Comprehension is checked first since it's the
// real signal Reading Understanding alone provides; falls back to the
// real trend/hesitation pacing signals when no comprehension data exists
// yet (e.g. mid-session, before Reading Understanding has run).
function pickEfficiencyLine(trend: AdaptiveTrend, hesitationRate: number, comprehensionAccuracy: number | null): string {
  if (comprehensionAccuracy !== null && comprehensionAccuracy < LOW_COMPREHENSION_ACCURACY && trend === 'improving') return 'Good Speed. Better Understanding.'
  if (comprehensionAccuracy !== null && comprehensionAccuracy >= HIGH_COMPREHENSION_ACCURACY && trend !== 'improving') return 'Excellent Accuracy. Increase Rhythm.'
  if (trend === 'improving') return 'Fast Recognition. Improve Flow.'
  if (hesitationRate < LOW_HESITATION_RATE) return 'Strong Focus. Read Bigger Chunks.'
  if (hesitationRate >= HIGH_HESITATION_RATE) return 'Reads Carefully. Can Read Faster.'
  return 'Good Rhythm. Needs Bigger Chunks.'
}

// Sprint-2.7 FIX-27 — "The AI should intelligently select the single
// highest-impact improvement based on performance." A real understanding
// gap (low comprehension accuracy) outranks pacing signals — fast
// reading without understanding is the most valuable real thing to fix
// first (Sprint-2.6B FIX-16's own rule).
function pickBiggestImprovement(trend: AdaptiveTrend, hesitationRate: number, comprehensionAccuracy: number | null): string {
  if (comprehensionAccuracy !== null && comprehensionAccuracy < LOW_COMPREHENSION_ACCURACY) return 'Increase Understanding Speed'
  if (hesitationRate >= HIGH_HESITATION_RATE) return 'Reduce Eye Stops'
  if (trend === 'declining') return 'Read Longer Comfortably'
  if (hesitationRate < LOW_HESITATION_RATE && trend === 'improving') return 'Read Bigger Chunks'
  return 'Improve Reading Rhythm'
}

// Reading Discovery™ Result screen — Sprint-2.6/2.6B/2.7. "Reading
// Awareness" is the hero, never raw WPM. Every line here is a real,
// deterministic band over this session's own real signals (`AdaptiveTrend`
// from `estimateAdaptiveChallenge`, a real hesitation ratio and real
// comprehension accuracy from `LearningIntelligenceEngine`'s own
// snapshot) — the same qualitative-banding discipline
// `resolveReadingConfidence.ts` / `resolveReadingStyle.ts` already
// established elsewhere in this app. Never a fabricated percentage,
// never a negative label — "always make them think: I'm doing well, I
// can become much better."
export function buildReadingProfileHighlights(
  trend: AdaptiveTrend,
  hesitationCount: number,
  signalCount: number,
  comprehensionAccuracy: number | null = null,
): ReadingProfileHighlights {
  const hesitationRate = signalCount > 0 ? hesitationCount / signalCount : 0

  return {
    profileLabel: pickProfileLabel(trend, hesitationRate),
    efficiencyLine: pickEfficiencyLine(trend, hesitationRate, comprehensionAccuracy),
    biggestImprovement: pickBiggestImprovement(trend, hesitationRate, comprehensionAccuracy),
  }
}
