import { describe, expect, it } from 'vitest'
import { DefaultProviderAdapter } from './DefaultProviderAdapter'
import { createProviderAdapterRegistry } from './DefaultProviderAdapterRegistry'
import { createProviderAdapterResolver } from './DefaultProviderAdapterResolver'
import { makeProviderAdapterMetadata } from '../testFixtures'

describe('DefaultProviderAdapterResolver', () => {
  it('Adapter Resolution: resolves a registered adapter by provider id', () => {
    const registry = createProviderAdapterRegistry()
    const resolver = createProviderAdapterResolver()
    const adapter = new DefaultProviderAdapter(makeProviderAdapterMetadata({ providerId: 'gemini' }))
    registry.register(adapter)

    expect(resolver.resolve(registry, 'gemini')).toBe(adapter)
  })

  it('Adapter Resolution: returns undefined for a provider id that was never registered', () => {
    const registry = createProviderAdapterRegistry()
    const resolver = createProviderAdapterResolver()

    expect(resolver.resolve(registry, 'grok')).toBeUndefined()
  })

  it('Capability Matching: resolves only the registered adapters that support a given capability', () => {
    const registry = createProviderAdapterRegistry()
    const resolver = createProviderAdapterResolver()
    const openai = new DefaultProviderAdapter(makeProviderAdapterMetadata({ providerId: 'openai', supportedFeatures: ['chat-completion', 'vision'] }))
    const localLlm = new DefaultProviderAdapter(makeProviderAdapterMetadata({ providerId: 'local-llm', supportedFeatures: ['chat-completion'] }))
    registry.register(openai)
    registry.register(localLlm)

    expect(resolver.resolveByCapability(registry, 'vision')).toEqual([openai])
    expect(resolver.resolveByCapability(registry, 'chat-completion')).toEqual([openai, localLlm])
  })
})
