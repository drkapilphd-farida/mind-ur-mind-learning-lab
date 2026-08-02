// Smart Notes™ Sprint-4 — Analytics & Insights™. Summary Cards — plain,
// structured data only; a card's own component formats `value`/`unit`
// into display text, the same pure-compute/format-at-display split this
// codebase already uses. Mirrors Memory Mode™'s own
// `AdaptiveSummaryCardData` (Sprint-4) exactly.
export type SmartNotesSummaryCardUnit = 'count' | 'percentage' | 'days'

export type SmartNotesSummaryCardData = {
  id: string
  label: string
  value: number
  unit: SmartNotesSummaryCardUnit
}
