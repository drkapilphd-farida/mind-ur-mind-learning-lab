import { describe, expect, it } from 'vitest'
import { buildAdaptiveSummaryCards } from './buildAdaptiveSummaryCards'

describe('buildAdaptiveSummaryCards', () => {
  it('builds four real cards from real profile, consistency, and strength data', () => {
    const profile = { sessionsCompleted: 4, totalConceptsReviewed: 30, averageConfidenceScore: 0.732, trend: 'improving' as const }
    const consistency = { activeDays: 3, currentStreakDays: 2, longestStreakDays: 3, averageSessionsPerActiveDay: 1.3 }
    const strengthDistribution = { strong: 5, developing: 2, needsReview: 1 }

    const cards = buildAdaptiveSummaryCards(profile, consistency, strengthDistribution)

    expect(cards).toEqual([
      { id: 'sessions-completed', label: 'Sessions Completed', value: 4, unit: 'count' },
      { id: 'average-confidence', label: 'Average Confidence', value: 73, unit: 'percentage' },
      { id: 'current-streak', label: 'Current Streak', value: 2, unit: 'days' },
      { id: 'concepts-strong', label: 'Concepts Strong', value: 5, unit: 'count' },
    ])
  })
})
