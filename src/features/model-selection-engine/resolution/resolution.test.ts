import { describe, expect, it } from 'vitest'
import { createModelCapabilityResolver } from '../capability'
import { createModelPriorityResolver } from '../priority'
import { createDefaultModelResolver } from './DefaultModelResolver'
import { createFallbackModelResolver } from './FallbackModelResolver'
import { makeModelCatalogEntry, makeModelMetadata, makeModelSelectionRequest } from '../testFixtures'

describe('DefaultModelResolver (Default Resolution)', () => {
  const capabilityResolver = createModelCapabilityResolver()
  const priorityResolver = createModelPriorityResolver()

  it('picks the highest-priority usable model for the requested provider when no preference is given', () => {
    const resolver = createDefaultModelResolver(capabilityResolver, priorityResolver)
    const gpt4o = makeModelCatalogEntry({ metadata: makeModelMetadata({ id: 'gpt-4o', providerId: 'openai' }), priority: 1 })
    const gpt4oMini = makeModelCatalogEntry({ metadata: makeModelMetadata({ id: 'gpt-4o-mini', providerId: 'openai' }), priority: 2 })

    const result = resolver.resolve([gpt4oMini, gpt4o], makeModelSelectionRequest({ providerId: 'openai' }))

    expect(result).toEqual(gpt4o)
  })

  it('scopes candidates to the requested provider only, ignoring other providers even at higher priority', () => {
    const resolver = createDefaultModelResolver(capabilityResolver, priorityResolver)
    const openaiModel = makeModelCatalogEntry({ metadata: makeModelMetadata({ id: 'gpt-4o', providerId: 'openai' }), priority: 5 })
    const anthropicModel = makeModelCatalogEntry({ metadata: makeModelMetadata({ id: 'claude-3-5-sonnet', providerId: 'anthropic' }), priority: 1 })

    const result = resolver.resolve([openaiModel, anthropicModel], makeModelSelectionRequest({ providerId: 'openai' }))

    expect(result).toEqual(openaiModel)
  })

  it('honors a preferred model id when it is usable and satisfies the request', () => {
    const resolver = createDefaultModelResolver(capabilityResolver, priorityResolver)
    const gpt4o = makeModelCatalogEntry({ metadata: makeModelMetadata({ id: 'gpt-4o', providerId: 'openai' }), priority: 1 })
    const gpt4oMini = makeModelCatalogEntry({ metadata: makeModelMetadata({ id: 'gpt-4o-mini', providerId: 'openai' }), priority: 2 })

    const result = resolver.resolve([gpt4o, gpt4oMini], makeModelSelectionRequest({ providerId: 'openai', preferredModelId: 'gpt-4o-mini' }))

    expect(result).toEqual(gpt4oMini)
  })

  it('Disabled Model: excludes models disabled by configuration', () => {
    const resolver = createDefaultModelResolver(capabilityResolver, priorityResolver)
    const disabled = makeModelCatalogEntry({
      metadata: makeModelMetadata({ id: 'gemini-1.5-flash', providerId: 'gemini' }),
      priority: 1,
      configuration: { enabled: false, maxRequestsPerMinute: 10 },
    })
    const enabled = makeModelCatalogEntry({ metadata: makeModelMetadata({ id: 'gemini-1.5-pro', providerId: 'gemini' }), priority: 2 })

    const result = resolver.resolve([disabled, enabled], makeModelSelectionRequest({ providerId: 'gemini' }))

    expect(result).toEqual(enabled)
  })

  it('excludes models that are not fully available', () => {
    const resolver = createDefaultModelResolver(capabilityResolver, priorityResolver)
    const degraded = makeModelCatalogEntry({ metadata: makeModelMetadata({ id: 'claude-3-opus', providerId: 'anthropic' }), priority: 1, availability: 'degraded' })
    const available = makeModelCatalogEntry({ metadata: makeModelMetadata({ id: 'claude-3-5-sonnet', providerId: 'anthropic' }), priority: 2 })

    const result = resolver.resolve([degraded, available], makeModelSelectionRequest({ providerId: 'anthropic' }))

    expect(result).toEqual(available)
  })

  it('Unsupported Capability: filters out models that lack the requested capability', () => {
    const resolver = createDefaultModelResolver(capabilityResolver, priorityResolver)
    const noVision = makeModelCatalogEntry({
      metadata: makeModelMetadata({ id: 'gpt-4o-mini', providerId: 'openai', supportedCapabilities: ['chat-completion'] }),
      priority: 1,
    })
    const withVision = makeModelCatalogEntry({
      metadata: makeModelMetadata({ id: 'gpt-4o', providerId: 'openai', supportedCapabilities: ['chat-completion', 'vision'] }),
      priority: 2,
    })

    const result = resolver.resolve([noVision, withVision], makeModelSelectionRequest({ providerId: 'openai', requestedCapability: 'vision' }))

    expect(result).toEqual(withVision)
  })

  it('filters by minimum context size', () => {
    const resolver = createDefaultModelResolver(capabilityResolver, priorityResolver)
    const smallContext = makeModelCatalogEntry({ metadata: makeModelMetadata({ id: 'gpt-4o-mini', providerId: 'openai', contextSize: 8000 }), priority: 1 })
    const largeContext = makeModelCatalogEntry({ metadata: makeModelMetadata({ id: 'gpt-4o', providerId: 'openai', contextSize: 128000 }), priority: 2 })

    const result = resolver.resolve([smallContext, largeContext], makeModelSelectionRequest({ providerId: 'openai', minimumContextSize: 100000 }))

    expect(result).toEqual(largeContext)
  })

  it('Unknown Model: returns undefined when nothing satisfies the request', () => {
    const resolver = createDefaultModelResolver(capabilityResolver, priorityResolver)
    const entry = makeModelCatalogEntry({ metadata: makeModelMetadata({ providerId: 'openai', supportedCapabilities: ['chat-completion'] }) })

    const result = resolver.resolve([entry], makeModelSelectionRequest({ providerId: 'openai', requestedCapability: 'vision' }))

    expect(result).toBeUndefined()
  })

  it('Unknown Model: an unrecognized preferredModelId is ignored, falling through to priority order', () => {
    const resolver = createDefaultModelResolver(capabilityResolver, priorityResolver)
    const entry = makeModelCatalogEntry({ metadata: makeModelMetadata({ id: 'gpt-4o', providerId: 'openai' }), priority: 1 })

    const result = resolver.resolve([entry], makeModelSelectionRequest({ providerId: 'openai', preferredModelId: 'unknown-model-id' }))

    expect(result).toEqual(entry)
  })
})

describe('FallbackModelResolver (Fallback Resolution)', () => {
  const priorityResolver = createModelPriorityResolver()

  it('ignores capability/context/preference constraints and picks the highest-priority usable model for the provider', () => {
    const resolver = createFallbackModelResolver(priorityResolver)
    const noVision = makeModelCatalogEntry({
      metadata: makeModelMetadata({ id: 'gpt-4o-mini', providerId: 'openai', supportedCapabilities: ['chat-completion'] }),
      priority: 1,
    })
    const withVision = makeModelCatalogEntry({
      metadata: makeModelMetadata({ id: 'gpt-4o', providerId: 'openai', supportedCapabilities: ['chat-completion', 'vision'] }),
      priority: 2,
    })

    const result = resolver.resolve(
      [noVision, withVision],
      makeModelSelectionRequest({ providerId: 'openai', requestedCapability: 'vision', preferredModelId: 'gpt-4o' }),
    )

    expect(result).toEqual(noVision)
  })

  it('stays scoped to the requested provider even in fallback', () => {
    const resolver = createFallbackModelResolver(priorityResolver)
    const openaiModel = makeModelCatalogEntry({ metadata: makeModelMetadata({ id: 'gpt-4o', providerId: 'openai' }), priority: 5 })
    const anthropicModel = makeModelCatalogEntry({ metadata: makeModelMetadata({ id: 'claude-3-5-sonnet', providerId: 'anthropic' }), priority: 1 })

    const result = resolver.resolve([openaiModel, anthropicModel], makeModelSelectionRequest({ providerId: 'openai' }))

    expect(result).toEqual(openaiModel)
  })

  it('returns undefined when nothing is usable for that provider at all', () => {
    const resolver = createFallbackModelResolver(priorityResolver)
    const unavailable = makeModelCatalogEntry({ metadata: makeModelMetadata({ providerId: 'gemini' }), availability: 'unavailable' })

    const result = resolver.resolve([unavailable], makeModelSelectionRequest({ providerId: 'gemini' }))

    expect(result).toBeUndefined()
  })
})
