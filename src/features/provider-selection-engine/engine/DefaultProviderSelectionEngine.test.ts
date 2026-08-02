import { describe, expect, it } from 'vitest'
import { createProviderCapabilityResolver } from '../capability'
import { createProviderPriorityResolver } from '../priority'
import { createProviderSelectionRegistry, type ProviderSelectionRegistry } from '../registry'
import { createDefaultProviderSelectionResolver, createFallbackProviderResolver } from '../resolution'
import { createProviderSelectionEngine } from './DefaultProviderSelectionEngine'
import { makeProviderCatalogEntry, makeProviderSelectionRequest } from '../testFixtures'
import type { ProviderSelectionEngine } from './ProviderSelectionEngine'

function makeEngine(): { registry: ProviderSelectionRegistry; engine: ProviderSelectionEngine } {
  const registry = createProviderSelectionRegistry()
  const priorityResolver = createProviderPriorityResolver()
  const capabilityResolver = createProviderCapabilityResolver()
  const defaultResolver = createDefaultProviderSelectionResolver(capabilityResolver, priorityResolver)
  const fallbackResolver = createFallbackProviderResolver(priorityResolver)
  const engine = createProviderSelectionEngine(registry, defaultResolver, fallbackResolver)
  return { registry, engine }
}

describe('DefaultProviderSelectionEngine', () => {
  it('Provider Selection / Priority Ordering: selects the highest-priority usable provider by default', () => {
    const { registry, engine } = makeEngine()
    registry.register(makeProviderCatalogEntry({ providerId: 'anthropic', priority: 2 }))
    registry.register(makeProviderCatalogEntry({ providerId: 'openai', priority: 1 }))

    const outcome = engine.select(makeProviderSelectionRequest())

    expect(outcome).toEqual({ selectedProviderId: 'openai', resolutionPath: 'default', reason: expect.any(String) })
  })

  it('marks resolutionPath: "preferred" when the caller\'s preferred provider is actually honored', () => {
    const { registry, engine } = makeEngine()
    registry.register(makeProviderCatalogEntry({ providerId: 'openai', priority: 1 }))
    registry.register(makeProviderCatalogEntry({ providerId: 'anthropic', priority: 2 }))

    const outcome = engine.select(makeProviderSelectionRequest({ preferredProviderId: 'anthropic' }))

    expect(outcome.selectedProviderId).toBe('anthropic')
    expect(outcome.resolutionPath).toBe('preferred')
  })

  it('Capability Matching: selects the only candidate that supports the requested capability', () => {
    const { registry, engine } = makeEngine()
    registry.register(makeProviderCatalogEntry({ providerId: 'grok', priority: 1, supportedCapabilities: ['chat-completion'] }))
    registry.register(makeProviderCatalogEntry({ providerId: 'openai', priority: 2, supportedCapabilities: ['chat-completion', 'vision'] }))

    const outcome = engine.select(makeProviderSelectionRequest({ requestedCapability: 'vision' }))

    expect(outcome.selectedProviderId).toBe('openai')
    expect(outcome.resolutionPath).toBe('default')
  })

  it('Fallback Provider: falls back to any usable provider when the strict request cannot be satisfied', () => {
    const { registry, engine } = makeEngine()
    registry.register(makeProviderCatalogEntry({ providerId: 'local-llm', priority: 1, supportedCapabilities: ['chat-completion'] }))

    const outcome = engine.select(makeProviderSelectionRequest({ requestedCapability: 'vision' }))

    expect(outcome).toEqual({ selectedProviderId: 'local-llm', resolutionPath: 'fallback', reason: expect.any(String) })
  })

  it('Invalid Provider: resolves to "none" when nothing registered is usable at all', () => {
    const { registry, engine } = makeEngine()
    registry.register(makeProviderCatalogEntry({ availability: 'unavailable' }))

    const outcome = engine.select(makeProviderSelectionRequest())

    expect(outcome).toEqual({ selectedProviderId: null, resolutionPath: 'none', reason: expect.any(String) })
  })
})
