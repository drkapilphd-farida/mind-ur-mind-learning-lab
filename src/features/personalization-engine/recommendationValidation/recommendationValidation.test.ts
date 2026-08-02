import { describe, expect, it } from 'vitest'
import { validateRecommendationSet } from './validateRecommendationSet'
import { makePersonalizationRecommendationSet, makeRecommendationGroup, makeRecommendationItem } from '../testFixtures'

describe('validateRecommendationSet', () => {
  it('reports valid: true for a well-formed, already-ordered set', () => {
    const set = makePersonalizationRecommendationSet()
    expect(validateRecommendationSet(set, [], {})).toEqual({ valid: true, issues: [] })
  })

  it('detects an empty-recommendation-set when there are no items at all', () => {
    const set = makePersonalizationRecommendationSet({ groups: [] })
    const result = validateRecommendationSet(set, [], {})
    expect(result.valid).toBe(false)
    expect(result.issues).toEqual([{ type: 'empty-recommendation-set', itemId: null, detail: expect.any(String) }])
  })

  it('detects an invalid-reference', () => {
    const item = makeRecommendationItem({ referenceId: '' })
    const set = makePersonalizationRecommendationSet({ groups: [makeRecommendationGroup({ items: [item] })] })
    const result = validateRecommendationSet(set, [], {})
    expect(result.issues.some((issue) => issue.type === 'invalid-reference')).toBe(true)
  })

  it('detects a duplicate-recommendation across groups', () => {
    const itemA = makeRecommendationItem({ id: 'rec-1', category: 'exercise' })
    const itemB = makeRecommendationItem({ id: 'rec-1', category: 'review' })
    const set = makePersonalizationRecommendationSet({
      groups: [makeRecommendationGroup({ category: 'exercise', items: [itemA] }), makeRecommendationGroup({ category: 'review', items: [itemB] })],
    })
    const result = validateRecommendationSet(set, [], {})
    expect(result.issues.some((issue) => issue.type === 'duplicate-recommendation')).toBe(true)
  })

  it('detects an ordering-violation when groups are out of execution sequence order', () => {
    const set = makePersonalizationRecommendationSet({
      groups: [
        makeRecommendationGroup({ category: 'session', items: [makeRecommendationItem({ id: 'session-1', category: 'session' })] }),
        makeRecommendationGroup({ category: 'journey', items: [makeRecommendationItem({ id: 'journey-1', category: 'journey' })] }),
      ],
    })
    const result = validateRecommendationSet(set, [], {})
    expect(result.issues.some((issue) => issue.type === 'ordering-violation')).toBe(true)
  })

  it('detects an ordering-violation when items within a group are out of priority order', () => {
    const items = [makeRecommendationItem({ id: 'a', priority: 'low' }), makeRecommendationItem({ id: 'b', priority: 'critical' })]
    const set = makePersonalizationRecommendationSet({ groups: [makeRecommendationGroup({ items })] })
    const result = validateRecommendationSet(set, [], {})
    expect(result.issues.some((issue) => issue.type === 'ordering-violation')).toBe(true)
  })

  it('detects a configuration-violation when a group exceeds maxRecommendationsPerCategory', () => {
    const items = [makeRecommendationItem({ id: 'a', priority: 'high' }), makeRecommendationItem({ id: 'b', priority: 'normal' })]
    const set = makePersonalizationRecommendationSet({ groups: [makeRecommendationGroup({ items })] })
    const result = validateRecommendationSet(set, [], { maxRecommendationsPerCategory: 1 })
    expect(result.issues.some((issue) => issue.type === 'configuration-violation')).toBe(true)
  })

  it('does not flag configuration compliance when no maxRecommendationsPerCategory fact is configured', () => {
    const items = [makeRecommendationItem({ id: 'a', priority: 'high' }), makeRecommendationItem({ id: 'b', priority: 'normal' })]
    const set = makePersonalizationRecommendationSet({ groups: [makeRecommendationGroup({ items })] })
    expect(validateRecommendationSet(set, [], {}).valid).toBe(true)
  })
})
