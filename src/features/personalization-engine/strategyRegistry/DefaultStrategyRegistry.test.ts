import { describe, expect, it } from 'vitest'
import { createStrategyRegistry } from './DefaultStrategyRegistry'
import { makePersonalizationStrategy } from '../testFixtures'

describe('DefaultStrategyRegistry', () => {
  it('resolveStrategy() returns null for an unregistered strategy', () => {
    const registry = createStrategyRegistry()
    expect(registry.resolveStrategy('does-not-exist')).toBeNull()
  })

  it('registerStrategy() then resolveStrategy() returns the same strategy', () => {
    const registry = createStrategyRegistry()
    const strategy = makePersonalizationStrategy()
    registry.registerStrategy(strategy)
    expect(registry.resolveStrategy(strategy.id)).toEqual(strategy)
  })

  it('registerStrategy() with the same id replaces the previous registration', () => {
    const registry = createStrategyRegistry()
    registry.registerStrategy(makePersonalizationStrategy({ priority: 1 }))
    registry.registerStrategy(makePersonalizationStrategy({ priority: 2 }))
    expect(registry.resolveStrategy('strategy-1')?.priority).toBe(2)
  })

  it('removeStrategy() deletes a registered strategy', () => {
    const registry = createStrategyRegistry()
    registry.registerStrategy(makePersonalizationStrategy())
    registry.removeStrategy('strategy-1')
    expect(registry.resolveStrategy('strategy-1')).toBeNull()
  })

  it('removeStrategy() is a no-op for an unregistered strategy', () => {
    const registry = createStrategyRegistry()
    expect(() => registry.removeStrategy('does-not-exist')).not.toThrow()
  })

  it('listStrategies() returns every registered strategy', () => {
    const registry = createStrategyRegistry()
    registry.registerStrategy(makePersonalizationStrategy({ id: 'a' }))
    registry.registerStrategy(makePersonalizationStrategy({ id: 'b' }))
    expect(registry.listStrategies().map((s) => s.id).sort()).toEqual(['a', 'b'])
  })

  it('listStrategies() returns an empty array when nothing is registered', () => {
    const registry = createStrategyRegistry()
    expect(registry.listStrategies()).toEqual([])
  })

  it('validateStrategyDefinition() delegates to the shared validator', () => {
    const registry = createStrategyRegistry()
    expect(registry.validateStrategyDefinition(makePersonalizationStrategy({ priority: 1 })).valid).toBe(true)
    expect(registry.validateStrategyDefinition(makePersonalizationStrategy({ priority: -1 })).valid).toBe(false)
  })
})
