import { describe, expect, it } from 'vitest'
import { createProviderRegistry } from './InMemoryProviderRegistry'
import { createMockAIProvider } from '../adapters'
import { makeAIModel, makeCapabilities, makeProviderMetadata } from '../testFixtures'

describe('InMemoryProviderRegistry', () => {
  it('register then get returns the same provider by id', () => {
    const registry = createProviderRegistry()
    const provider = createMockAIProvider({ metadata: makeProviderMetadata({ id: 'acme' }), models: [makeAIModel()] })
    registry.register(provider)
    expect(registry.get('acme')).toBe(provider)
  })

  it('get returns undefined for an id that was never registered', () => {
    const registry = createProviderRegistry()
    expect(registry.get('missing')).toBeUndefined()
  })

  it('register overwrites an existing entry with the same providerId, rather than throwing', () => {
    const registry = createProviderRegistry()
    const first = createMockAIProvider({ metadata: makeProviderMetadata({ id: 'acme', displayName: 'First' }), models: [makeAIModel()] })
    const second = createMockAIProvider({ metadata: makeProviderMetadata({ id: 'acme', displayName: 'Second' }), models: [makeAIModel()] })
    registry.register(first)
    registry.register(second)
    expect(registry.get('acme')).toBe(second)
    expect(registry.list()).toHaveLength(1)
  })

  it('unregister removes a provider by id', () => {
    const registry = createProviderRegistry()
    registry.register(createMockAIProvider({ metadata: makeProviderMetadata({ id: 'acme' }), models: [makeAIModel()] }))
    registry.unregister('acme')
    expect(registry.get('acme')).toBeUndefined()
  })

  it('list returns every registered provider', () => {
    const registry = createProviderRegistry()
    registry.register(createMockAIProvider({ metadata: makeProviderMetadata({ id: 'a' }), models: [makeAIModel()] }))
    registry.register(createMockAIProvider({ metadata: makeProviderMetadata({ id: 'b' }), models: [makeAIModel()] }))
    expect(registry.list().map((provider) => provider.metadata.id).sort()).toEqual(['a', 'b'])
  })

  it('findByCapability returns only providers with a model declaring that capability', () => {
    const registry = createProviderRegistry()
    const visionCapable = createMockAIProvider({
      metadata: makeProviderMetadata({ id: 'vision-provider' }),
      models: [makeAIModel({ capabilities: makeCapabilities({ vision: true }) })],
    })
    const chatOnly = createMockAIProvider({
      metadata: makeProviderMetadata({ id: 'chat-provider' }),
      models: [makeAIModel({ capabilities: makeCapabilities({ vision: false }) })],
    })
    registry.register(visionCapable)
    registry.register(chatOnly)

    expect(registry.findByCapability('vision').map((provider) => provider.metadata.id)).toEqual(['vision-provider'])
  })
})
