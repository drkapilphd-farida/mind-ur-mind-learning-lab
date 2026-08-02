import { describe, expect, it } from 'vitest'
import { describeSelectionReason } from './describeSelectionReason'
import { selectStrategies } from './selectStrategies'
import { makePersonalizationContext, makePersonalizationDecision, makePersonalizationProfile, makePersonalizationStrategy } from '../testFixtures'

describe('describeSelectionReason', () => {
  it('reports a new recommendation when no prior decision matches', () => {
    const strategy = makePersonalizationStrategy({ type: 'difficulty', outcomeValue: 'advanced' })
    expect(describeSelectionReason(strategy, [])).toContain('New recommendation')
  })

  it('reports confirmation when a prior decision already recommended the same type and value', () => {
    const strategy = makePersonalizationStrategy({ type: 'difficulty', outcomeValue: 'advanced' })
    const decisions = [
      makePersonalizationDecision({
        recommendations: [{ decisionType: 'difficulty', value: 'advanced', matchedRuleId: 'r1', reason: 'x' }],
      }),
    ]
    expect(describeSelectionReason(strategy, decisions)).toContain('Confirms prior recommendation')
  })
})

describe('selectStrategies', () => {
  it('selects the highest-priority (lowest number) eligible strategy per type', () => {
    const strategies = [
      makePersonalizationStrategy({ id: 'low-priority', type: 'difficulty', priority: 5, outcomeValue: 'easy' }),
      makePersonalizationStrategy({ id: 'high-priority', type: 'difficulty', priority: 1, outcomeValue: 'advanced' }),
    ]
    const inputs = { profile: makePersonalizationProfile(), decisions: [], context: makePersonalizationContext() }
    const results = selectStrategies(strategies, inputs)
    expect(results).toEqual([{ strategyId: 'high-priority', type: 'difficulty', value: 'advanced', reason: expect.any(String) }])
  })

  it('produces no result for a type with no eligible strategy', () => {
    const strategies = [makePersonalizationStrategy({ type: 'difficulty', condition: { inputType: 'assessment-results', factKey: 'x', operator: 'equals', value: 1 } })]
    const inputs = { profile: makePersonalizationProfile(), decisions: [], context: makePersonalizationContext() }
    expect(selectStrategies(strategies, inputs)).toEqual([])
  })

  it('selects independently across all 4 strategy types', () => {
    const strategies = [
      makePersonalizationStrategy({ id: 'd', type: 'difficulty', priority: 1, outcomeValue: 'advanced' }),
      makePersonalizationStrategy({ id: 'l', type: 'learning-sequence', priority: 1, outcomeValue: 'linear' }),
      makePersonalizationStrategy({ id: 'r', type: 'review-frequency', priority: 1, outcomeValue: 'weekly' }),
      makePersonalizationStrategy({ id: 's', type: 'session-length', priority: 1, outcomeValue: '20min' }),
    ]
    const inputs = { profile: makePersonalizationProfile(), decisions: [], context: makePersonalizationContext() }
    const results = selectStrategies(strategies, inputs)
    expect(results.map((r) => r.type)).toEqual(['difficulty', 'learning-sequence', 'review-frequency', 'session-length'])
  })

  it('breaks a priority tie deterministically by strategy id', () => {
    const strategies = [
      makePersonalizationStrategy({ id: 'b', type: 'difficulty', priority: 1, outcomeValue: 'b-value' }),
      makePersonalizationStrategy({ id: 'a', type: 'difficulty', priority: 1, outcomeValue: 'a-value' }),
    ]
    const inputs = { profile: makePersonalizationProfile(), decisions: [], context: makePersonalizationContext() }
    const results = selectStrategies(strategies, inputs)
    expect(results[0]?.strategyId).toBe('a')
  })

  it('returns an empty array for an empty strategy list', () => {
    const inputs = { profile: makePersonalizationProfile(), decisions: [], context: makePersonalizationContext() }
    expect(selectStrategies([], inputs)).toEqual([])
  })
})
