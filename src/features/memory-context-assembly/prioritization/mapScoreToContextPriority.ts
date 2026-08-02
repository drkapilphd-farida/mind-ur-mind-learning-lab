import type { ContextPriority } from '../domain'

// Pure — fixed, documented thresholds. `PINNED_WEIGHT` (150) alone
// already crosses the `critical` threshold, matching "Pinned memories"
// being listed first among the prioritization criteria; a single
// `critical`-importance memory with no other factors (40) lands in
// `medium`, since importance alone isn't meant to dominate the way pin
// status does.
export function mapScoreToContextPriority(score: number): ContextPriority {
  if (score >= 120) return 'critical'
  if (score >= 70) return 'high'
  if (score >= 30) return 'medium'
  return 'low'
}
