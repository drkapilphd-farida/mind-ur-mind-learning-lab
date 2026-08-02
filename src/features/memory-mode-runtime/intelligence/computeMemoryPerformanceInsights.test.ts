import { describe, expect, it } from 'vitest'
import { computeMemoryPerformanceInsights } from './computeMemoryPerformanceInsights'

describe('computeMemoryPerformanceInsights', () => {
  it('reports a real, honest message when there are no completed sessions yet', () => {
    const insights = computeMemoryPerformanceInsights({ sessionsCompleted: 0, totalConceptsReviewed: 0, averageConfidenceScore: 0, trend: 'insufficient-data' })
    expect(insights).toEqual(['No memory sessions completed yet — insights will appear after your first session.'])
  })

  it('singularizes real counts of exactly one', () => {
    const insights = computeMemoryPerformanceInsights({ sessionsCompleted: 1, totalConceptsReviewed: 1, averageConfidenceScore: 0.8, trend: 'insufficient-data' })
    expect(insights[0]).toBe('1 memory session completed so far.')
    expect(insights[1]).toBe('1 concept reviewed in total.')
  })

  it('pluralizes real counts above one and surfaces an improving trend', () => {
    const insights = computeMemoryPerformanceInsights({ sessionsCompleted: 3, totalConceptsReviewed: 12, averageConfidenceScore: 0.9, trend: 'improving' })
    expect(insights[0]).toBe('3 memory sessions completed so far.')
    expect(insights[1]).toBe('12 concepts reviewed in total.')
    expect(insights[2]).toBe('Confidence has been trending up across recent sessions.')
  })

  it('never uses banned quiz/test/score vocabulary', () => {
    const insights = computeMemoryPerformanceInsights({ sessionsCompleted: 5, totalConceptsReviewed: 20, averageConfidenceScore: 0.5, trend: 'declining' })
    const combined = insights.join(' ').toLowerCase()
    expect(combined).not.toMatch(/\b(quiz|test|score|grade|correct|wrong)\b/)
  })
})
