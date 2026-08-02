import { describe, expect, it } from 'vitest'
import { createProviderCapabilityResolver } from './DefaultProviderCapabilityResolver'
import { makeProviderCatalogEntry } from '../testFixtures'

describe('DefaultProviderCapabilityResolver (Capability Matching)', () => {
  it('returns only the entries that declare the requested capability', () => {
    const resolver = createProviderCapabilityResolver()
    const withVision = makeProviderCatalogEntry({ providerId: 'openai', supportedCapabilities: ['chat-completion', 'vision'] })
    const withoutVision = makeProviderCatalogEntry({ providerId: 'local-llm', supportedCapabilities: ['chat-completion'] })

    expect(resolver.filterByCapability([withVision, withoutVision], 'vision')).toEqual([withVision])
  })

  it('returns an empty list when no entry declares the requested capability', () => {
    const resolver = createProviderCapabilityResolver()
    const entry = makeProviderCatalogEntry({ supportedCapabilities: ['chat-completion'] })

    expect(resolver.filterByCapability([entry], 'multimodal')).toEqual([])
  })
})
