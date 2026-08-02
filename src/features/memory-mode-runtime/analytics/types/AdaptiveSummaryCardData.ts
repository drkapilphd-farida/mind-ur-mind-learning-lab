// Memory Mode™ Sprint-4 — Memory Analytics & Insights™. Adaptive Summary
// Cards — plain, structured data only; a card's own component formats
// `value`/`unit` into display text (percentage rounding, day pluralization,
// …), the same pure-compute/format-at-display split this codebase already
// uses (`RuntimeProgress.estimatedTimeLeftSeconds` → `formatEstimatedTimeRemaining`).
export type AdaptiveSummaryCardUnit = 'count' | 'percentage' | 'days'

export type AdaptiveSummaryCardData = {
  id: string
  label: string
  value: number
  unit: AdaptiveSummaryCardUnit
}
