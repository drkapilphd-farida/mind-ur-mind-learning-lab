import { describe, expect, it } from 'vitest'
import { computeSmartNotesImprovementInsights } from './computeSmartNotesImprovementInsights'

const ZERO_CONSISTENCY = { activeDays: 0, currentStreakDays: 0, longestStreakDays: 0, averageSessionsPerActiveDay: 0 }

describe('computeSmartNotesImprovementInsights', () => {
  it('reports a real, honest message for a learner with no completed sessions yet', () => {
    const profile = { sessionsCompleted: 0, totalConceptsReviewed: 0, averageEngagementScore: 0, trend: 'insufficient-data' as const, documentsWithNotes: 0 }
    expect(computeSmartNotesImprovementInsights(profile, ZERO_CONSISTENCY, null)).toEqual(['Complete your first smart notes session to start seeing improvement insights.'])
  })

  it('surfaces a real streak once it reaches two real days', () => {
    const profile = { sessionsCompleted: 3, totalConceptsReviewed: 10, averageEngagementScore: 0.6, trend: 'steady' as const, documentsWithNotes: 2 }
    const consistency = { ...ZERO_CONSISTENCY, currentStreakDays: 3 }

    expect(computeSmartNotesImprovementInsights(profile, consistency, null)).toContain("You're on a 3-day streak.")
  })

  it('surfaces a real, positive comparison message when engagement rose meaningfully', () => {
    const profile = { sessionsCompleted: 2, totalConceptsReviewed: 8, averageEngagementScore: 0.6, trend: 'steady' as const, documentsWithNotes: 1 }
    const comparison = { currentSessionId: 'b', previousSessionId: 'a', engagementScoreDelta: 0.2, completionRateDelta: 0.1, revisitRateDelta: -0.1 }

    expect(computeSmartNotesImprovementInsights(profile, ZERO_CONSISTENCY, comparison)).toContain('Your most recent session showed higher engagement than the one before it.')
  })

  it('falls back to a real, honest default when no other real signal applies', () => {
    const profile = { sessionsCompleted: 1, totalConceptsReviewed: 4, averageEngagementScore: 0.5, trend: 'insufficient-data' as const, documentsWithNotes: 0 }
    expect(computeSmartNotesImprovementInsights(profile, ZERO_CONSISTENCY, null)).toEqual(['Keep going — more sessions will surface clearer patterns.'])
  })

  it('never uses banned quiz/test/score vocabulary', () => {
    const profile = { sessionsCompleted: 5, totalConceptsReviewed: 20, averageEngagementScore: 0.5, trend: 'declining' as const, documentsWithNotes: 3 }
    const combined = computeSmartNotesImprovementInsights(profile, { ...ZERO_CONSISTENCY, currentStreakDays: 4 }, null)
      .join(' ')
      .toLowerCase()
    expect(combined).not.toMatch(/\b(quiz|test|score|grade|correct|wrong)\b/)
  })
})
