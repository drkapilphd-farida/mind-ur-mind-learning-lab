import type { PerformanceDomain } from './PerformanceSignal'

// Discover Your Learning Potential™ — Sprint-1 Foundation. Adaptive
// Discovery™'s real output shape — "never fixed difficulty, never fixed
// WPM... continuously estimate the user's optimal challenge level."
// `level` is domain-relative (a real WPM number for `reading`, a real
// item-count/complexity number for `memory`/`focus` once those engines
// exist) — this type only fixes the shared shape, not the domain-
// specific scale.
export type AdaptiveTrend = 'improving' | 'stable' | 'declining'

export type AdaptiveChallengeEstimate = {
  domain: PerformanceDomain
  level: number
  trend: AdaptiveTrend
  // 0-100, same disclosed-heuristic discipline as `resolveReadingConfidence.ts`
  // and `speedRecommendation.ts`'s own real confidence score — never a
  // fabricated precision beyond what the real underlying signal count supports.
  confidence: number
  reason: string
}
