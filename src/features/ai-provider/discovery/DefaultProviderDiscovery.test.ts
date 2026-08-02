import { describe, expect, it } from 'vitest'
import { createProviderDiscovery } from './DefaultProviderDiscovery'
import { createProviderRegistry } from '../registry'
import { createMockAIProvider } from '../adapters'
import { makeAIModel, makeCapabilities, makeProviderMetadata } from '../testFixtures'
import type { ProviderRegistry } from '../contracts'

describe('DefaultProviderDiscovery', () => {
  function buildRegistry(): ProviderRegistry {
    const registry = createProviderRegistry()
    registry.register(
      createMockAIProvider({
        metadata: makeProviderMetadata({ id: 'acme', displayName: 'Acme' }),
        models: [makeAIModel({ id: 'acme-chat', providerId: 'acme', capabilities: makeCapabilities({ vision: false }) })],
      }),
    )
    registry.register(
      createMockAIProvider({
        metadata: makeProviderMetadata({ id: 'zenith', displayName: 'Zenith' }),
        models: [makeAIModel({ id: 'zenith-vision', providerId: 'zenith', capabilities: makeCapabilities({ vision: true }) })],
      }),
    )
    return registry
  }

  it('listProviderMetadata returns every registered provider’s metadata', () => {
    const discovery = createProviderDiscovery(buildRegistry())
    expect(discovery.listProviderMetadata().map((metadata) => metadata.id).sort()).toEqual(['acme', 'zenith'])
  })

  it('listAllModels flattens models across every registered provider', () => {
    const discovery = createProviderDiscovery(buildRegistry())
    expect(discovery.listAllModels().map((model) => model.id).sort()).toEqual(['acme-chat', 'zenith-vision'])
  })

  it('findModelsByCapability returns only models declaring that capability', () => {
    const discovery = createProviderDiscovery(buildRegistry())
    expect(discovery.findModelsByCapability('vision').map((model) => model.id)).toEqual(['zenith-vision'])
  })

  it('findProviderForModel returns the owning provider for a known model id', () => {
    const discovery = createProviderDiscovery(buildRegistry())
    expect(discovery.findProviderForModel('zenith-vision')?.metadata.id).toBe('zenith')
  })

  it('findProviderForModel returns undefined for an unknown model id', () => {
    const discovery = createProviderDiscovery(buildRegistry())
    expect(discovery.findProviderForModel('does-not-exist')).toBeUndefined()
  })

  it('reflects registry mutations — never caches a stale list', () => {
    const registry = buildRegistry()
    const discovery = createProviderDiscovery(registry)
    registry.unregister('zenith')
    expect(discovery.listProviderMetadata().map((metadata) => metadata.id)).toEqual(['acme'])
  })
})
