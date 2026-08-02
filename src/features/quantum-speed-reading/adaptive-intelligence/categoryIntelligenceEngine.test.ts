import { describe, it, expect } from 'vitest'
import { computeCategoryIntelligence, computeCategoryPerformance } from './categoryIntelligenceEngine'
import { buildSession } from './testFixtures'

const NOW = new Date('2026-07-04T12:00:00.000Z').getTime()

describe('computeCategoryIntelligence', () => {
  it('identifies strong categories (avg accuracy >= 85)', () => {
    const sessions = [buildSession({ category: 'science', accuracyPercent: 90 })]
    const result = computeCategoryIntelligence(sessions, NOW)
    expect(result.strongCategories).toContain('science')
  })

  it('identifies weak categories (avg accuracy < 70)', () => {
    const sessions = [buildSession({ category: 'history', accuracyPercent: 50 })]
    const result = computeCategoryIntelligence(sessions, NOW)
    expect(result.weakCategories).toContain('history')
  })

  it('identifies recently practiced categories (within 7 days)', () => {
    const sessions = [buildSession({ category: 'science', occurredAt: '2026-07-03T12:00:00.000Z' })]
    const result = computeCategoryIntelligence(sessions, NOW)
    expect(result.recentlyPracticed).toContain('science')
  })

  it('flags categories needing revision (not practiced in 14+ days)', () => {
    const sessions = [buildSession({ category: 'history', occurredAt: '2026-06-01T12:00:00.000Z' })]
    const result = computeCategoryIntelligence(sessions, NOW)
    expect(result.needsRevision).toContain('history')
  })

  it('suggests a never-practiced category for rotation over a repeat', () => {
    const sessions = [buildSession({ category: 'science', accuracyPercent: 95 })]
    const result = computeCategoryIntelligence(sessions, NOW)
    expect(result.suggestedNextCategory).not.toBe('science')
    expect(result.suggestedNextCategory).not.toBeNull()
  })

  it('falls back to a weak category once every category has been tried at least once', () => {
    const allCategories = ['science', 'history', 'psychology', 'biography', 'business', 'technology', 'motivation', 'general-knowledge'] as const
    const sessions = allCategories.map((category) =>
      buildSession({ category, accuracyPercent: category === 'history' ? 50 : 90 }),
    )
    const result = computeCategoryIntelligence(sessions, NOW)
    expect(result.suggestedNextCategory).toBe('history')
  })

  it('ignores incomplete sessions entirely', () => {
    const sessions = [buildSession({ category: 'science', completed: false, accuracyPercent: 99 })]
    const result = computeCategoryIntelligence(sessions, NOW)
    expect(result.strongCategories).not.toContain('science')
  })
})

describe('computeCategoryPerformance', () => {
  it('rolls up session count and average accuracy per category', () => {
    const sessions = [
      buildSession({ category: 'science', accuracyPercent: 80 }),
      buildSession({ category: 'science', accuracyPercent: 100 }),
      buildSession({ category: 'history', accuracyPercent: 60 }),
    ]
    const performance = computeCategoryPerformance(sessions)
    const science = performance.find((p) => p.category === 'science')
    expect(science?.sessionCount).toBe(2)
    expect(science?.averageAccuracy).toBe(90)
  })

  it('excludes categories with only incomplete sessions', () => {
    const sessions = [buildSession({ category: 'science', completed: false })]
    const performance = computeCategoryPerformance(sessions)
    expect(performance.find((p) => p.category === 'science')).toBeUndefined()
  })
})
