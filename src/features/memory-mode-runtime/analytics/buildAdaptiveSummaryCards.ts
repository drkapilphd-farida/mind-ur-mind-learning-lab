import type { MemoryLearningProfile } from '../intelligence'
import type { MemoryConsistencyMetrics } from './types/MemoryConsistencyMetrics'
import type { MemoryStrengthDistribution } from './types/MemoryStrengthLevel'
import type { AdaptiveSummaryCardData } from './types/AdaptiveSummaryCardData'

// Memory Mode™ Sprint-4 — Memory Analytics & Insights™. Adaptive Summary
// Cards (item 8). Pure — four real, already-computed figures, structured
// for display, never formatted here (the card component owns rounding/
// pluralization, matching the codebase's own pure-compute/format-at-
// display split).
export function buildAdaptiveSummaryCards(profile: MemoryLearningProfile, consistency: MemoryConsistencyMetrics, strengthDistribution: MemoryStrengthDistribution): readonly AdaptiveSummaryCardData[] {
  return [
    { id: 'sessions-completed', label: 'Sessions Completed', value: profile.sessionsCompleted, unit: 'count' },
    { id: 'average-confidence', label: 'Average Confidence', value: Math.round(profile.averageConfidenceScore * 100), unit: 'percentage' },
    { id: 'current-streak', label: 'Current Streak', value: consistency.currentStreakDays, unit: 'days' },
    { id: 'concepts-strong', label: 'Concepts Strong', value: strengthDistribution.strong, unit: 'count' },
  ]
}
