import { describe, expect, it } from 'vitest'
import { buildSmartNotesSummaryCards } from './buildSmartNotesSummaryCards'

describe('buildSmartNotesSummaryCards', () => {
  it('builds five real cards from real profile, consistency, and engagement data', () => {
    const profile = { sessionsCompleted: 4, totalConceptsReviewed: 30, averageEngagementScore: 0.732, trend: 'improving' as const, documentsWithNotes: 3 }
    const consistency = { activeDays: 3, currentStreakDays: 2, longestStreakDays: 3, averageSessionsPerActiveDay: 1.3 }
    const engagementDistribution = { strong: 5, developing: 2, needsReview: 1 }

    const cards = buildSmartNotesSummaryCards(profile, consistency, engagementDistribution)

    expect(cards).toEqual([
      { id: 'sessions-completed', label: 'Sessions Completed', value: 4, unit: 'count' },
      { id: 'average-engagement', label: 'Average Engagement', value: 73, unit: 'percentage' },
      { id: 'current-streak', label: 'Current Streak', value: 2, unit: 'days' },
      { id: 'strong-sessions', label: 'Strongly Engaged Sessions', value: 5, unit: 'count' },
      { id: 'documents-with-notes', label: 'Documents With Notes', value: 3, unit: 'count' },
    ])
  })
})
