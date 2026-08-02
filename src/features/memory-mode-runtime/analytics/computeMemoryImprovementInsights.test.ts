import { describe, expect, it } from 'vitest'
import { computeMemoryImprovementInsights } from './computeMemoryImprovementInsights'

const ZERO_CONSISTENCY = { activeDays: 0, currentStreakDays: 0, longestStreakDays: 0, averageSessionsPerActiveDay: 0 }

describe('computeMemoryImprovementInsights', () => {
  it('reports a real, honest message for a learner with no completed sessions yet', () => {
    const profile = { sessionsCompleted: 0, totalConceptsReviewed: 0, averageConfidenceScore: 0, trend: 'insufficient-data' as const }
    expect(computeMemoryImprovementInsights(profile, ZERO_CONSISTENCY, null)).toEqual(['Complete your first memory session to start seeing improvement insights.'])
  })

  it('surfaces a real streak once it reaches two real days', () => {
    const profile = { sessionsCompleted: 3, totalConceptsReviewed: 10, averageConfidenceScore: 0.6, trend: 'steady' as const }
    const consistency = { ...ZERO_CONSISTENCY, currentStreakDays: 3 }

    expect(computeMemoryImprovementInsights(profile, consistency, null)).toContain("You're on a 3-day streak.")
  })

  it('surfaces a real, positive comparison message when confidence rose meaningfully', () => {
    const profile = { sessionsCompleted: 2, totalConceptsReviewed: 8, averageConfidenceScore: 0.6, trend: 'steady' as const }
    const comparison = { currentSessionId: 'b', previousSessionId: 'a', confidenceScoreDelta: 0.2, completionRateDelta: 0.1, revisitRateDelta: -0.1 }

    expect(computeMemoryImprovementInsights(profile, ZERO_CONSISTENCY, comparison)).toContain('Your most recent session showed higher confidence than the one before it.')
  })

  it('falls back to a real, honest default when no other real signal applies', () => {
    const profile = { sessionsCompleted: 1, totalConceptsReviewed: 4, averageConfidenceScore: 0.5, trend: 'insufficient-data' as const }
    expect(computeMemoryImprovementInsights(profile, ZERO_CONSISTENCY, null)).toEqual(['Keep going — more sessions will surface clearer patterns.'])
  })

  it('never uses banned quiz/test/score vocabulary', () => {
    const profile = { sessionsCompleted: 5, totalConceptsReviewed: 20, averageConfidenceScore: 0.5, trend: 'declining' as const }
    const combined = computeMemoryImprovementInsights(profile, { ...ZERO_CONSISTENCY, currentStreakDays: 4 }, null)
      .join(' ')
      .toLowerCase()
    expect(combined).not.toMatch(/\b(quiz|test|score|grade|correct|wrong)\b/)
  })
})
