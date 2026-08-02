import { describe, expect, it } from 'vitest'
import { computeSmartNotesInsights } from './computeSmartNotesInsights'

describe('computeSmartNotesInsights', () => {
  it('reports a real, honest message when there are no completed sessions yet', () => {
    const insights = computeSmartNotesInsights({ sessionsCompleted: 0, totalConceptsReviewed: 0, averageEngagementScore: 0, trend: 'insufficient-data', documentsWithNotes: 0 })
    expect(insights).toEqual(['No smart notes sessions completed yet — insights will appear after your first session.'])
  })

  it('singularizes real counts of exactly one', () => {
    const insights = computeSmartNotesInsights({ sessionsCompleted: 1, totalConceptsReviewed: 1, averageEngagementScore: 0.8, trend: 'insufficient-data', documentsWithNotes: 1 })
    expect(insights[0]).toBe('1 smart notes session completed so far.')
    expect(insights[1]).toBe('1 concept reviewed in total.')
    expect(insights[2]).toBe("You've saved notes on 1 document.")
  })

  it('pluralizes real counts above one and surfaces an improving trend', () => {
    const insights = computeSmartNotesInsights({ sessionsCompleted: 3, totalConceptsReviewed: 12, averageEngagementScore: 0.9, trend: 'improving', documentsWithNotes: 2 })
    expect(insights[0]).toBe('3 smart notes sessions completed so far.')
    expect(insights[1]).toBe('12 concepts reviewed in total.')
    expect(insights[2]).toBe("You've saved notes on 2 documents.")
    expect(insights[3]).toBe('Engagement has been trending up across recent sessions.')
  })

  it('omits the notes-coverage sentence, honestly, when no documents have real notes yet', () => {
    const insights = computeSmartNotesInsights({ sessionsCompleted: 2, totalConceptsReviewed: 6, averageEngagementScore: 0.5, trend: 'steady', documentsWithNotes: 0 })
    expect(insights.some((insight) => insight.includes('saved notes'))).toBe(false)
  })

  it('never uses banned quiz/test/score vocabulary', () => {
    const insights = computeSmartNotesInsights({ sessionsCompleted: 5, totalConceptsReviewed: 20, averageEngagementScore: 0.5, trend: 'declining', documentsWithNotes: 3 })
    const combined = insights.join(' ').toLowerCase()
    expect(combined).not.toMatch(/\b(quiz|test|score|grade|correct|wrong)\b/)
  })
})
