import { describe, expect, it } from 'vitest'
import { createProviderCapabilityResolver } from '../capability'
import { createProviderPriorityResolver } from '../priority'
import { createDefaultProviderSelectionResolver } from './DefaultProviderSelectionResolver'
import { createFallbackProviderResolver } from './FallbackProviderResolver'
import { makeProviderCatalogEntry, makeProviderSelectionRequest } from '../testFixtures'

describe('DefaultProviderSelectionResolver (Default Provider)', () => {
  const capabilityResolver = createProviderCapabilityResolver()
  const priorityResolver = createProviderPriorityResolver()

  it('picks the highest-priority usable candidate when no preference is given', () => {
    const resolver = createDefaultProviderSelectionResolver(capabilityResolver, priorityResolver)
    const openai = makeProviderCatalogEntry({ providerId: 'openai', priority: 1 })
    const anthropic = makeProviderCatalogEntry({ providerId: 'anthropic', priority: 2 })

    expect(resolver.resolve([anthropic, openai], makeProviderSelectionRequest())).toEqual(openai)
  })

  it('honors a preferred provider id when it is usable and satisfies the request', () => {
    const resolver = createDefaultProviderSelectionResolver(capabilityResolver, priorityResolver)
    const openai = makeProviderCatalogEntry({ providerId: 'openai', priority: 1 })
    const anthropic = makeProviderCatalogEntry({ providerId: 'anthropic', priority: 2 })

    const result = resolver.resolve([openai, anthropic], makeProviderSelectionRequest({ preferredProviderId: 'anthropic' }))

    expect(result).toEqual(anthropic)
  })

  it('excludes candidates that are not fully available', () => {
    const resolver = createDefaultProviderSelectionResolver(capabilityResolver, priorityResolver)
    const degraded = makeProviderCatalogEntry({ providerId: 'gemini', priority: 1, availability: 'degraded' })
    const available = makeProviderCatalogEntry({ providerId: 'anthropic', priority: 2, availability: 'available' })

    expect(resolver.resolve([degraded, available], makeProviderSelectionRequest())).toEqual(available)
  })

  it('excludes candidates that are disabled by configuration', () => {
    const resolver = createDefaultProviderSelectionResolver(capabilityResolver, priorityResolver)
    const disabled = makeProviderCatalogEntry({ providerId: 'local-llm', priority: 1, configuration: { enabled: false, maxRequestsPerMinute: 10 } })
    const enabled = makeProviderCatalogEntry({ providerId: 'openai', priority: 2 })

    expect(resolver.resolve([disabled, enabled], makeProviderSelectionRequest())).toEqual(enabled)
  })

  it('filters by requested capability and required model', () => {
    const resolver = createDefaultProviderSelectionResolver(capabilityResolver, priorityResolver)
    const noVision = makeProviderCatalogEntry({ providerId: 'grok', priority: 1, supportedCapabilities: ['chat-completion'], supportedModels: ['grok-2'] })
    const withVision = makeProviderCatalogEntry({
      providerId: 'openai',
      priority: 2,
      supportedCapabilities: ['chat-completion', 'vision'],
      supportedModels: ['gpt-4o'],
    })

    const byCapability = resolver.resolve([noVision, withVision], makeProviderSelectionRequest({ requestedCapability: 'vision' }))
    expect(byCapability).toEqual(withVision)

    const byModel = resolver.resolve([noVision, withVision], makeProviderSelectionRequest({ requiredModel: 'grok-2' }))
    expect(byModel).toEqual(noVision)
  })

  it('Invalid Provider: returns undefined when nothing satisfies the request', () => {
    const resolver = createDefaultProviderSelectionResolver(capabilityResolver, priorityResolver)
    const entry = makeProviderCatalogEntry({ supportedCapabilities: ['chat-completion'] })

    expect(resolver.resolve([entry], makeProviderSelectionRequest({ requestedCapability: 'vision' }))).toBeUndefined()
  })

  it('Invalid Provider: an unrecognized preferredProviderId is ignored, falling through to priority order', () => {
    const resolver = createDefaultProviderSelectionResolver(capabilityResolver, priorityResolver)
    const entry = makeProviderCatalogEntry({ providerId: 'openai', priority: 1 })

    const result = resolver.resolve([entry], makeProviderSelectionRequest({ preferredProviderId: 'unknown-provider' }))

    expect(result).toEqual(entry)
  })
})

describe('FallbackProviderResolver (Fallback Provider)', () => {
  const priorityResolver = createProviderPriorityResolver()

  it('ignores capability/model/preference constraints and picks the highest-priority usable candidate', () => {
    const resolver = createFallbackProviderResolver(priorityResolver)
    const noVision = makeProviderCatalogEntry({ providerId: 'grok', priority: 1, supportedCapabilities: ['chat-completion'] })
    const withVision = makeProviderCatalogEntry({ providerId: 'openai', priority: 2, supportedCapabilities: ['chat-completion', 'vision'] })

    const result = resolver.resolve([noVision, withVision], makeProviderSelectionRequest({ requestedCapability: 'vision', preferredProviderId: 'openai' }))

    expect(result).toEqual(noVision)
  })

  it('returns undefined when nothing is usable at all', () => {
    const resolver = createFallbackProviderResolver(priorityResolver)
    const unavailable = makeProviderCatalogEntry({ availability: 'unavailable' })

    expect(resolver.resolve([unavailable], makeProviderSelectionRequest())).toBeUndefined()
  })
})
