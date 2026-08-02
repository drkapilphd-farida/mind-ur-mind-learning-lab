import type { MemorySessionAnalytics } from './types/MemorySessionAnalytics'
import type { MemoryStrengthDistribution } from './types/MemoryStrengthLevel'

// Memory Mode™ Sprint-4 — Memory Analytics & Insights™. Memory Strength
// Indicators (item 4), aggregate. Pure — a real count of real sessions in
// each real strength band, never a new score.
export function computeMemoryStrengthDistribution(analytics: readonly MemorySessionAnalytics[]): MemoryStrengthDistribution {
  const distribution: MemoryStrengthDistribution = { strong: 0, developing: 0, needsReview: 0 }

  for (const entry of analytics) {
    if (entry.strengthLevel === 'strong') distribution.strong += 1
    else if (entry.strengthLevel === 'developing') distribution.developing += 1
    else distribution.needsReview += 1
  }

  return distribution
}
