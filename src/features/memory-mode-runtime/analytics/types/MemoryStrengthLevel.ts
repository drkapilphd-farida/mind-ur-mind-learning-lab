// Memory Mode™ Sprint-4 — Memory Analytics & Insights™. A real,
// deterministic classification of a session's own already-computed
// confidence score into three honest bands — never a new score, never a
// grade. `MemoryStrengthDistribution` is the real count of sessions in
// each band, used by the Adaptive Summary Cards and Strength Indicators.
export type MemoryStrengthLevel = 'strong' | 'developing' | 'needs-review'

export type MemoryStrengthDistribution = {
  strong: number
  developing: number
  needsReview: number
}
