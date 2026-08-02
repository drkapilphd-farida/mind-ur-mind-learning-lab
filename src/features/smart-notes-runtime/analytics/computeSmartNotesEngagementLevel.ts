import type { SmartNotesEngagementLevel } from './types/SmartNotesEngagementLevel'

// Smart Notes™ Sprint-4 — Analytics & Insights™. Per-session engagement
// classification. Pure, deterministic bands over Sprint-3's own real
// engagement score — disclosed thresholds, not a validated cutoff.
// Mirrors Memory Mode™'s own `computeMemoryStrengthLevel` (Sprint-4)
// exactly.
const STRONG_THRESHOLD = 0.75
const DEVELOPING_THRESHOLD = 0.45

export function computeSmartNotesEngagementLevel(engagementScore: number): SmartNotesEngagementLevel {
  if (engagementScore >= STRONG_THRESHOLD) return 'strong'
  if (engagementScore >= DEVELOPING_THRESHOLD) return 'developing'
  return 'needs-review'
}
