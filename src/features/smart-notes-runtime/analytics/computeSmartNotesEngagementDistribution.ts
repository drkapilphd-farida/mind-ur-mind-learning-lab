import type { SmartNotesSessionAnalytics } from './types/SmartNotesSessionAnalytics'
import type { SmartNotesEngagementDistribution } from './types/SmartNotesEngagementLevel'

// Smart Notes™ Sprint-4 — Analytics & Insights™. Aggregate engagement
// distribution. Pure — a real count of real sessions in each real
// engagement band, never a new score. Mirrors Memory Mode™'s own
// `computeMemoryStrengthDistribution` (Sprint-4) exactly.
export function computeSmartNotesEngagementDistribution(analytics: readonly SmartNotesSessionAnalytics[]): SmartNotesEngagementDistribution {
  const distribution: SmartNotesEngagementDistribution = { strong: 0, developing: 0, needsReview: 0 }

  for (const entry of analytics) {
    if (entry.engagementLevel === 'strong') distribution.strong += 1
    else if (entry.engagementLevel === 'developing') distribution.developing += 1
    else distribution.needsReview += 1
  }

  return distribution
}
