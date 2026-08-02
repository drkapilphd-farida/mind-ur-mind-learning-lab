import type { PerformanceDomain, PerformanceSignal } from '../types/PerformanceSignal'
import type { AdaptiveChallengeEstimate, AdaptiveTrend } from '../types/AdaptiveChallengeEstimate'

// Adaptive Discovery™ runtime — trend detection. The exact real
// windowing algorithm `src/lib/exercise-engine/speedRecommendation.ts`'s
// own `detectTrend` already uses (last-3-vs-prior-2 average comparison,
// ±5 threshold) — ported here rather than reimplemented from scratch,
// generalized to work over any domain's real `PerformanceSignal[]`
// instead of that engine's own flashcard-speed-specific accuracy array.
// That function stays untouched; this is a new, domain-general sibling
// for a genuinely different content shape (continuous reading/memory/
// focus signals, not fixed exercise tiers).
const TREND_RECENT_WINDOW = 3
const TREND_PRIOR_WINDOW = 2
const TREND_THRESHOLD = 5

function detectTrend(values: readonly number[]): AdaptiveTrend {
  if (values.length < TREND_RECENT_WINDOW) return 'stable'
  const recent = values.slice(-TREND_RECENT_WINDOW)
  const prior = values.slice(-(TREND_RECENT_WINDOW + TREND_PRIOR_WINDOW), -TREND_RECENT_WINDOW)
  if (prior.length === 0) return 'stable'

  const recentAverage = average(recent)
  const priorAverage = average(prior)
  if (recentAverage > priorAverage + TREND_THRESHOLD) return 'improving'
  if (recentAverage < priorAverage - TREND_THRESHOLD) return 'declining'
  return 'stable'
}

function average(values: readonly number[]): number {
  return values.reduce((sum, value) => sum + value, 0) / values.length
}

// Learning Intelligence Engine™ — "continuously estimate the user's
// optimal challenge level... never fixed difficulty, never fixed WPM."
// Real, deterministic, over whatever real signals have been recorded so
// far for a domain — honestly reports zero confidence when nothing has
// been recorded yet, never a guessed starting level. `confidence` grows
// with real sample size (same disclosed-heuristic discipline as
// `resolveReadingConfidence.ts`), capped at 100 — never a fabricated
// precision beyond what the real signal count supports.
export function estimateAdaptiveChallenge(domain: PerformanceDomain, signals: readonly PerformanceSignal[]): AdaptiveChallengeEstimate {
  const domainSignals = signals.filter((signal) => signal.domain === domain)

  if (domainSignals.length === 0) {
    return { domain, level: 0, trend: 'stable', confidence: 0, reason: 'No real signals recorded yet for this domain.' }
  }

  const values = domainSignals.map((signal) => signal.value)
  const trend = detectTrend(values)
  const level = values[values.length - 1] ?? 0
  const confidence = Math.min(100, domainSignals.length * 20)

  const reason =
    trend === 'improving'
      ? `Recent performance is trending up across ${domainSignals.length} real signals — the next challenge can step up.`
      : trend === 'declining'
        ? `Recent performance is trending down — the next challenge should ease off slightly, not reset to easiest.`
        : `Performance is steady across ${domainSignals.length} real signals — holding the current challenge level.`

  return { domain, level, trend, confidence, reason }
}
