// 21-Day Transformation Journey™ — the 4 domains this feature tracks
// performance across. 'reading' deliberately has no corresponding row in
// `domain_performance_sessions` (see that migration's own comment) —
// its accuracy already lives in `daily_quantum_sessions`, read directly
// by getWeakestDomain.ts rather than duplicated here.
export type JourneyDomain = 'reading' | 'intuition' | 'right_brain' | 'visualisation'

export const JOURNEY_DOMAIN_LABELS: Record<JourneyDomain, string> = {
  reading: 'Reading',
  intuition: 'Intuition',
  right_brain: 'Right Brain',
  visualisation: 'Visualisation',
}
