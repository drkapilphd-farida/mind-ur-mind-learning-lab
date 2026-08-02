import type { MemoryStrengthLevel } from './types/MemoryStrengthLevel'

// Memory Mode™ Sprint-4 — Memory Analytics & Insights™. Memory Strength
// Indicators (item 4), per session. Pure, deterministic bands over
// Sprint-3's own real confidence score — disclosed thresholds, not a
// validated psychometric cutoff.
const STRONG_THRESHOLD = 0.75
const DEVELOPING_THRESHOLD = 0.45

export function computeMemoryStrengthLevel(confidenceScore: number): MemoryStrengthLevel {
  if (confidenceScore >= STRONG_THRESHOLD) return 'strong'
  if (confidenceScore >= DEVELOPING_THRESHOLD) return 'developing'
  return 'needs-review'
}
