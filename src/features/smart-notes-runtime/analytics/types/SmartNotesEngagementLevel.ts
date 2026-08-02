// Smart Notes™ Sprint-4 — Analytics & Insights™. A real, deterministic
// classification of a session's own already-computed engagement score
// into three honest bands — never a new score, never a grade, never a
// judgment of note content. Mirrors Memory Mode™'s own
// `MemoryStrengthLevel`/`MemoryStrengthDistribution` (Sprint-4) exactly,
// renamed to match Sprint-3's own "engagement" (not "confidence")
// vocabulary.
export type SmartNotesEngagementLevel = 'strong' | 'developing' | 'needs-review'

export type SmartNotesEngagementDistribution = {
  strong: number
  developing: number
  needsReview: number
}
