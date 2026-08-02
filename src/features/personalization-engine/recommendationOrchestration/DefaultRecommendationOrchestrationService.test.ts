import { describe, expect, it } from 'vitest'
import { createRecommendationOrchestrationService } from './DefaultRecommendationOrchestrationService'
import {
  makeExecutionSequence,
  makeExecutionStep,
  makeFixedClock,
  makePersonalizationExecutionPlan,
  makeRecommendationBuilderInputs,
  makeSequentialIdGenerator,
  makeStrategyResult,
} from '../testFixtures'

const NOW = '2026-06-01T00:00:00.000Z'

describe('DefaultRecommendationOrchestrationService', () => {
  it('generate() produces an ordered set, a valid validation result, and diagnostics together', () => {
    const service = createRecommendationOrchestrationService({ clock: makeFixedClock(NOW), idGenerator: makeSequentialIdGenerator('set') })
    const executionPlan = makePersonalizationExecutionPlan({
      sequences: [
        makeExecutionSequence({ type: 'session', steps: [makeExecutionStep({ id: 's1', sequenceType: 'session' })] }),
        makeExecutionSequence({ type: 'journey', steps: [makeExecutionStep({ id: 'j1', sequenceType: 'journey' })] }),
      ],
    })
    const inputs = makeRecommendationBuilderInputs({ executionPlan, strategyResults: [makeStrategyResult({ type: 'difficulty' })] })

    const result = service.generate(inputs)

    expect(result.recommendationSet.id).toBe('set-1')
    expect(result.recommendationSet.metadata.generatedAt).toBe(NOW)
    expect(result.recommendationSet.groups.map((group) => group.category)).toEqual(['journey', 'session'])
    expect(result.validationResult).toEqual({ valid: true, issues: [] })
    expect(result.diagnostics.validationStatus).toBe('valid')
    expect(result.diagnostics.totalRecommendations).toBe(2)
  })

  it('reports an invalid validation result and matching diagnostics for an empty execution plan', () => {
    const service = createRecommendationOrchestrationService()
    const inputs = makeRecommendationBuilderInputs({ executionPlan: makePersonalizationExecutionPlan({ sequences: [] }) })

    const result = service.generate(inputs)

    expect(result.validationResult.valid).toBe(false)
    expect(result.validationResult.issues.some((issue) => issue.type === 'empty-recommendation-set')).toBe(true)
    expect(result.diagnostics.validationStatus).toBe('invalid')
    expect(result.diagnostics.totalRecommendations).toBe(0)
  })

  it('uses default dependencies when no overrides are given', () => {
    const service = createRecommendationOrchestrationService()
    const result = service.generate(makeRecommendationBuilderInputs())
    expect(result.recommendationSet.id).toBeTruthy()
    expect(result.recommendationSet.metadata.generatedAt).toBeTruthy()
  })
})
