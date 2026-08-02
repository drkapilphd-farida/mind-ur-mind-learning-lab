import { describe, expect, it } from 'vitest'
import { orderRecommendationGroups } from './orderRecommendationGroups'
import { makeRecommendationItem, makeStrategyResult } from '../testFixtures'

describe('orderRecommendationGroups', () => {
  it('orders groups by the execution sequence (journey, exercise, difficulty, review, session)', () => {
    const groups = [
      { category: 'session' as const, items: [] },
      { category: 'journey' as const, items: [] },
      { category: 'review' as const, items: [] },
      { category: 'exercise' as const, items: [] },
      { category: 'difficulty' as const, items: [] },
    ]
    const ordered = orderRecommendationGroups(groups, [])
    expect(ordered.map((group) => group.category)).toEqual(['journey', 'exercise', 'difficulty', 'review', 'session'])
  })

  it('orders items within a group by priority, highest first', () => {
    const items = [
      makeRecommendationItem({ id: 'a', priority: 'low' }),
      makeRecommendationItem({ id: 'b', priority: 'critical' }),
      makeRecommendationItem({ id: 'c', priority: 'normal' }),
    ]
    const [group] = orderRecommendationGroups([{ category: 'exercise', items }], [])
    expect(group?.items.map((item) => item.id)).toEqual(['b', 'c', 'a'])
  })

  it('breaks equal-priority ties by strategy precedence, strategy-backed items first', () => {
    const items = [
      makeRecommendationItem({ id: 'no-strategy', category: 'difficulty', priority: 'high' }),
      makeRecommendationItem({ id: 'has-strategy', category: 'difficulty', priority: 'high' }),
    ]
    const strategyResults = [makeStrategyResult({ type: 'difficulty' })]
    const [group] = orderRecommendationGroups([{ category: 'difficulty', items }], strategyResults)
    expect(group?.items.map((item) => item.id)).toEqual(['has-strategy', 'no-strategy'])
  })

  it('breaks remaining ties deterministically by id', () => {
    const items = [
      makeRecommendationItem({ id: 'z', priority: 'normal' }),
      makeRecommendationItem({ id: 'a', priority: 'normal' }),
    ]
    const [group] = orderRecommendationGroups([{ category: 'exercise', items }], [])
    expect(group?.items.map((item) => item.id)).toEqual(['a', 'z'])
  })

  it('never treats journey/exercise items as strategy-backed', () => {
    const items = [makeRecommendationItem({ id: 'a', category: 'journey', priority: 'high' })]
    const strategyResults = [makeStrategyResult({ type: 'difficulty' })]
    const [group] = orderRecommendationGroups([{ category: 'journey', items }], strategyResults)
    expect(group?.items).toEqual(items)
  })
})
