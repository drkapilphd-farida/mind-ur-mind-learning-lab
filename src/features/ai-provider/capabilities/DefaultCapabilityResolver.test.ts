import { describe, expect, it } from 'vitest'
import { createCapabilityResolver } from './DefaultCapabilityResolver'
import { createMockAIProvider } from '../adapters'
import { makeAIModel, makeCapabilities, makeProviderMetadata } from '../testFixtures'

describe('DefaultCapabilityResolver', () => {
  const resolver = createCapabilityResolver()

  it('supportsAll is true when a model declares every required capability', () => {
    const model = makeAIModel({ capabilities: makeCapabilities({ vision: true, reasoning: true }) })
    expect(resolver.supportsAll(model, ['vision', 'reasoning'])).toBe(true)
  })

  it('supportsAll is false when a model is missing even one required capability', () => {
    const model = makeAIModel({ capabilities: makeCapabilities({ vision: true, reasoning: false }) })
    expect(resolver.supportsAll(model, ['vision', 'reasoning'])).toBe(false)
  })

  it('supportsAll is vacuously true for an empty capability list', () => {
    expect(resolver.supportsAll(makeAIModel(), [])).toBe(true)
  })

  it('filterProvidersByCapabilities returns everything unfiltered when nothing is required', () => {
    const providers = [
      createMockAIProvider({ metadata: makeProviderMetadata({ id: 'a' }), models: [makeAIModel()] }),
      createMockAIProvider({ metadata: makeProviderMetadata({ id: 'b' }), models: [makeAIModel()] }),
    ]
    expect(resolver.filterProvidersByCapabilities(providers, [])).toEqual(providers)
  })

  it('filterProvidersByCapabilities keeps a provider if any one of its models satisfies every required capability', () => {
    const visionProvider = createMockAIProvider({
      metadata: makeProviderMetadata({ id: 'vision-provider' }),
      models: [makeAIModel({ id: 'chat-model', capabilities: makeCapabilities({ vision: false }) }), makeAIModel({ id: 'vision-model', capabilities: makeCapabilities({ vision: true }) })],
    })
    const chatOnlyProvider = createMockAIProvider({
      metadata: makeProviderMetadata({ id: 'chat-provider' }),
      models: [makeAIModel({ capabilities: makeCapabilities({ vision: false }) })],
    })

    const result = resolver.filterProvidersByCapabilities([visionProvider, chatOnlyProvider], ['vision'])
    expect(result.map((provider) => provider.metadata.id)).toEqual(['vision-provider'])
  })
})
