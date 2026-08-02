import { describe, expect, it } from 'vitest'
import { buildRecommendationSet } from './buildRecommendationSet'
import { makeExecutionSequence, makeExecutionStep, makePersonalizationExecutionPlan, makeRecommendationBuilderInputs } from '../testFixtures'

const NOW = '2026-06-01T00:00:00.000Z'

describe('buildRecommendationSet', () => {
  it('maps each execution sequence to a group and each step to an item', () => {
    const executionPlan = makePersonalizationExecutionPlan({
      sequences: [
        makeExecutionSequence({ type: 'journey', steps: [makeExecutionStep({ id: 'j1', sequenceType: 'journey', referenceId: 'journey-a', priority: 'high', detail: 'go' })] }),
      ],
    })
    const inputs = makeRecommendationBuilderInputs({ executionPlan })
    const set = buildRecommendationSet(inputs, NOW, 'set-1')

    expect(set.id).toBe('set-1')
    expect(set.version).toBe(1)
    expect(set.metadata).toEqual({ learnerId: inputs.learnerId, profileId: inputs.profileId, source: 'recommendation-builder', generatedAt: NOW })
    expect(set.groups).toEqual([
      { category: 'journey', items: [{ id: 'recommendation-j1', category: 'journey', referenceId: 'journey-a', priority: 'high', rationale: 'go' }] },
    ])
  })

  it('escalates every item priority one tier when memoryFacts.hasCriticalSection is true', () => {
    const executionPlan = makePersonalizationExecutionPlan({
      sequences: [makeExecutionSequence({ type: 'exercise', steps: [makeExecutionStep({ sequenceType: 'exercise', priority: 'normal' })] })],
    })
    const inputs = makeRecommendationBuilderInputs({ executionPlan, memoryFacts: { hasCriticalSection: true } })
    const set = buildRecommendationSet(inputs, NOW, 'set-1')
    expect(set.groups[0]?.items[0]?.priority).toBe('high')
  })

  it('does not escalate critical priority beyond critical', () => {
    const executionPlan = makePersonalizationExecutionPlan({
      sequences: [makeExecutionSequence({ type: 'exercise', steps: [makeExecutionStep({ sequenceType: 'exercise', priority: 'critical' })] })],
    })
    const inputs = makeRecommendationBuilderInputs({ executionPlan, memoryFacts: { hasCriticalSection: true } })
    const set = buildRecommendationSet(inputs, NOW, 'set-1')
    expect(set.groups[0]?.items[0]?.priority).toBe('critical')
  })

  it('produces an empty groups array for an execution plan with no sequences', () => {
    const inputs = makeRecommendationBuilderInputs({ executionPlan: makePersonalizationExecutionPlan({ sequences: [] }) })
    expect(buildRecommendationSet(inputs, NOW, 'set-1').groups).toEqual([])
  })

  it('is deterministic — identical inputs produce an identical set', () => {
    const inputs = makeRecommendationBuilderInputs()
    expect(buildRecommendationSet(inputs, NOW, 'set-1')).toEqual(buildRecommendationSet(inputs, NOW, 'set-1'))
  })
})
