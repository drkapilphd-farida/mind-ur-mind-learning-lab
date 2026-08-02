import { describe, expect, it } from 'vitest'
import { createModelCapabilityResolver } from '../capability'
import { createModelPriorityResolver } from '../priority'
import { createModelRegistry, type ModelRegistry } from '../registry'
import { createDefaultModelResolver, createFallbackModelResolver } from '../resolution'
import { createModelSelectionEngine } from './DefaultModelSelectionEngine'
import { makeModelCatalogEntry, makeModelMetadata, makeModelSelectionRequest } from '../testFixtures'
import type { ModelSelectionEngine } from './ModelSelectionEngine'

function makeEngine(): { registry: ModelRegistry; engine: ModelSelectionEngine } {
  const registry = createModelRegistry()
  const priorityResolver = createModelPriorityResolver()
  const capabilityResolver = createModelCapabilityResolver()
  const defaultResolver = createDefaultModelResolver(capabilityResolver, priorityResolver)
  const fallbackResolver = createFallbackModelResolver(priorityResolver)
  const engine = createModelSelectionEngine(registry, defaultResolver, fallbackResolver)
  return { registry, engine }
}

describe('DefaultModelSelectionEngine', () => {
  it('Selection / Priority Ordering: selects the highest-priority usable model for the requested provider', () => {
    const { registry, engine } = makeEngine()
    registry.register(makeModelCatalogEntry({ metadata: makeModelMetadata({ id: 'gpt-4o-mini', providerId: 'openai' }), priority: 2 }))
    registry.register(makeModelCatalogEntry({ metadata: makeModelMetadata({ id: 'gpt-4o', providerId: 'openai' }), priority: 1 }))

    const outcome = engine.select(makeModelSelectionRequest({ providerId: 'openai' }))

    expect(outcome).toEqual({ selectedModelId: 'gpt-4o', resolutionPath: 'default', reason: expect.any(String) })
  })

  it('marks resolutionPath: "preferred" when the caller\'s preferred model is actually honored', () => {
    const { registry, engine } = makeEngine()
    registry.register(makeModelCatalogEntry({ metadata: makeModelMetadata({ id: 'gpt-4o', providerId: 'openai' }), priority: 1 }))
    registry.register(makeModelCatalogEntry({ metadata: makeModelMetadata({ id: 'gpt-4o-mini', providerId: 'openai' }), priority: 2 }))

    const outcome = engine.select(makeModelSelectionRequest({ providerId: 'openai', preferredModelId: 'gpt-4o-mini' }))

    expect(outcome.selectedModelId).toBe('gpt-4o-mini')
    expect(outcome.resolutionPath).toBe('preferred')
  })

  it('Capability Matching: selects the only model that supports the requested capability', () => {
    const { registry, engine } = makeEngine()
    registry.register(makeModelCatalogEntry({ metadata: makeModelMetadata({ id: 'gpt-4o-mini', providerId: 'openai', supportedCapabilities: ['chat-completion'] }), priority: 1 }))
    registry.register(makeModelCatalogEntry({ metadata: makeModelMetadata({ id: 'gpt-4o', providerId: 'openai', supportedCapabilities: ['chat-completion', 'vision'] }), priority: 2 }))

    const outcome = engine.select(makeModelSelectionRequest({ providerId: 'openai', requestedCapability: 'vision' }))

    expect(outcome.selectedModelId).toBe('gpt-4o')
    expect(outcome.resolutionPath).toBe('default')
  })

  it('Fallback Resolution: falls back to any usable model for the provider when the strict request cannot be satisfied', () => {
    const { registry, engine } = makeEngine()
    registry.register(makeModelCatalogEntry({ metadata: makeModelMetadata({ id: 'gpt-4o-mini', providerId: 'openai', supportedCapabilities: ['chat-completion'] }), priority: 1 }))

    const outcome = engine.select(makeModelSelectionRequest({ providerId: 'openai', requestedCapability: 'vision' }))

    expect(outcome).toEqual({ selectedModelId: 'gpt-4o-mini', resolutionPath: 'fallback', reason: expect.any(String) })
  })

  it('Empty Registry: resolves to "none" when nothing is registered at all', () => {
    const { engine } = makeEngine()

    const outcome = engine.select(makeModelSelectionRequest({ providerId: 'openai' }))

    expect(outcome).toEqual({ selectedModelId: null, resolutionPath: 'none', reason: expect.any(String) })
  })

  it('resolves to "none" when the registry has models, but none for the requested provider', () => {
    const { registry, engine } = makeEngine()
    registry.register(makeModelCatalogEntry({ metadata: makeModelMetadata({ id: 'claude-3-5-sonnet', providerId: 'anthropic' }) }))

    const outcome = engine.select(makeModelSelectionRequest({ providerId: 'openai' }))

    expect(outcome).toEqual({ selectedModelId: null, resolutionPath: 'none', reason: expect.any(String) })
  })
})
