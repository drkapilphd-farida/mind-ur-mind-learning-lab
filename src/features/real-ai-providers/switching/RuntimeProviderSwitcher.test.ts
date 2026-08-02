import { describe, expect, it, vi } from 'vitest'
import { createRuntimeProviderSwitcher } from './RuntimeProviderSwitcher'
import { NoRegisteredProviderError } from './NoRegisteredProviderError'
import { createRealProviderRegistry } from '../registration'
import type { ResolvedProvider, RuntimeProviderResolver } from '@/features/ai-provider-configuration/contracts'

function stubResolver(resolution: ResolvedProvider): RuntimeProviderResolver {
  return { resolve: async () => resolution }
}

describe('RuntimeProviderSwitcher', () => {
  it('resolves to the mock provider when the resolver says mock', async () => {
    const { registry, adapters } = createRealProviderRegistry()
    const switcher = createRuntimeProviderSwitcher({
      registry,
      adapters,
      resolver: stubResolver({ providerId: 'mock', isMock: true, reason: 'mock is the configured active provider' }),
    })

    const { provider, resolution } = await switcher.getActiveProvider()
    expect(provider.metadata.id).toBe('mock')
    expect(resolution.isMock).toBe(true)
  })

  it('resolves to a real provider when the resolver says so and it is registered', async () => {
    process.env.OPENAI_API_KEY = 'test-key-for-this-test-only'
    try {
      const { registry, adapters } = createRealProviderRegistry()
      const switcher = createRuntimeProviderSwitcher({
        registry,
        adapters,
        resolver: stubResolver({ providerId: 'openai', isMock: false, reason: 'enabled, credentialed, healthy' }),
      })

      const { provider } = await switcher.getActiveProvider()
      expect(provider.metadata.id).toBe('openai')
    } finally {
      delete process.env.OPENAI_API_KEY
    }
  })

  it('falls back to the registry mock entry if the resolved providerId is not actually registered', async () => {
    const { registry, adapters } = createRealProviderRegistry()
    const switcher = createRuntimeProviderSwitcher({
      registry,
      adapters,
      resolver: stubResolver({ providerId: 'gemini', isMock: false, reason: 'somehow resolved to an unregistered provider' }),
    })

    const { provider } = await switcher.getActiveProvider()
    expect(provider.metadata.id).toBe('mock')
  })

  it('throws NoRegisteredProviderError if even mock is missing from the registry (defense-in-depth)', async () => {
    const { registry, adapters } = createRealProviderRegistry()
    registry.unregister('mock')
    const switcher = createRuntimeProviderSwitcher({
      registry,
      adapters,
      resolver: stubResolver({ providerId: 'gemini', isMock: false, reason: 'unregistered' }),
    })

    await expect(switcher.getActiveProvider()).rejects.toBeInstanceOf(NoRegisteredProviderError)
  })

  it('initializes a resolved provider at most once, even across repeated calls', async () => {
    const { registry, adapters } = createRealProviderRegistry()
    const mockAdapter = adapters.find((adapter) => adapter.metadata.id === 'mock')
    if (!mockAdapter) throw new Error('expected mock adapter to be registered')
    const initializeSpy = vi.spyOn(mockAdapter, 'initialize')

    const switcher = createRuntimeProviderSwitcher({
      registry,
      adapters,
      resolver: stubResolver({ providerId: 'mock', isMock: true, reason: 'mock' }),
    })

    await switcher.getActiveProvider()
    await switcher.getActiveProvider()

    expect(initializeSpy).toHaveBeenCalledTimes(1)
  })

  it('the returned provider is actually usable — generate() works after resolution', async () => {
    const { registry, adapters } = createRealProviderRegistry()
    const switcher = createRuntimeProviderSwitcher({
      registry,
      adapters,
      resolver: stubResolver({ providerId: 'mock', isMock: true, reason: 'mock' }),
    })

    const { provider } = await switcher.getActiveProvider()
    const response = await provider.generate({ id: 'req-1', modelId: 'mock-default-chat', messages: [{ role: 'user', content: 'hi' }] })
    expect(response.content.length).toBeGreaterThan(0)
  })
})
