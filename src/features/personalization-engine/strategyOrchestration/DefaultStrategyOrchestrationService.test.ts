import { describe, expect, it } from 'vitest'
import { createStrategyOrchestrationService } from './DefaultStrategyOrchestrationService'
import { createStrategyRegistry } from '../strategyRegistry'
import { makePersonalizationContext, makePersonalizationProfile, makePersonalizationStrategy } from '../testFixtures'

describe('DefaultStrategyOrchestrationService', () => {
  it('execute() loads registered strategies, validates the set, and selects results', () => {
    const registry = createStrategyRegistry()
    registry.registerStrategy(makePersonalizationStrategy({ id: 'a', type: 'difficulty', priority: 1, outcomeValue: 'advanced' }))

    const service = createStrategyOrchestrationService({ registry })
    const inputs = { profile: makePersonalizationProfile(), decisions: [], context: makePersonalizationContext() }
    const result = service.execute(inputs)

    expect(result.validationResult).toEqual({ valid: true, issues: [] })
    expect(result.results).toEqual([{ strategyId: 'a', type: 'difficulty', value: 'advanced', reason: expect.any(String) }])
  })

  it('reports validation issues for a structurally broken strategy set without failing selection', () => {
    const registry = createStrategyRegistry()
    registry.registerStrategy(makePersonalizationStrategy({ id: 'a', dependsOnStrategyIds: ['does-not-exist'] }))

    const service = createStrategyOrchestrationService({ registry })
    const inputs = { profile: makePersonalizationProfile(), decisions: [], context: makePersonalizationContext() }
    const result = service.execute(inputs)

    expect(result.validationResult.valid).toBe(false)
    expect(result.results).toHaveLength(1)
  })

  it('reports an empty-strategy-set validation issue and no results when nothing is registered', () => {
    const service = createStrategyOrchestrationService({ registry: createStrategyRegistry() })
    const inputs = { profile: makePersonalizationProfile(), decisions: [], context: makePersonalizationContext() }
    const result = service.execute(inputs)

    expect(result.validationResult.issues.some((issue) => issue.type === 'empty-strategy-set')).toBe(true)
    expect(result.results).toEqual([])
  })

  it('uses default dependencies when no overrides are given', () => {
    const service = createStrategyOrchestrationService()
    const inputs = { profile: makePersonalizationProfile(), decisions: [], context: makePersonalizationContext() }
    const result = service.execute(inputs)
    expect(result.results).toEqual([])
    expect(result.validationResult.valid).toBe(false)
  })
})
