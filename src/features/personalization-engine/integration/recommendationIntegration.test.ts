import { describe, expect, it } from 'vitest'
import { buildRecommendationBuilderInputs } from './buildRecommendationBuilderInputs'
import { makeContextPackage, makeMemoryConfiguration, makePersonalizationExecutionPlan, makeStrategyResult } from '../testFixtures'

describe('buildRecommendationBuilderInputs', () => {
  it('composes decisions, strategy results, the execution plan, and reduced facts', () => {
    const executionPlan = makePersonalizationExecutionPlan()
    const inputs = buildRecommendationBuilderInputs({
      profileId: 'profile-1',
      learnerId: 'learner-1',
      executionPlan,
      decisions: [],
      strategyResults: [makeStrategyResult()],
      memoryContext: makeContextPackage(),
      configuration: makeMemoryConfiguration({ entries: [{ key: 'maxRecommendationsPerCategory', value: 2 }] }),
    })

    expect(inputs.executionPlan).toBe(executionPlan)
    expect(inputs.strategyResults).toHaveLength(1)
    expect(inputs.memoryFacts.sectionCount).toBe(1)
    expect(inputs.configurationFacts).toEqual({ maxRecommendationsPerCategory: 2 })
  })

  it('handles null memoryContext/configuration inputs', () => {
    const inputs = buildRecommendationBuilderInputs({
      profileId: 'profile-1',
      learnerId: 'learner-1',
      executionPlan: makePersonalizationExecutionPlan(),
      decisions: [],
      strategyResults: [],
      memoryContext: null,
      configuration: null,
    })

    expect(inputs.memoryFacts).toEqual({})
    expect(inputs.configurationFacts).toEqual({})
  })
})
