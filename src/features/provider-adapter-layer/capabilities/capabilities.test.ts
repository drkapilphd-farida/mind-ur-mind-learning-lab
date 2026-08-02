import { describe, expect, it } from 'vitest'
import { resolveProviderAdapterCapabilities } from './resolveProviderAdapterCapabilities'
import { makeProviderAdapterMetadata } from '../testFixtures'

describe('resolveProviderAdapterCapabilities', () => {
  it('derives the capability bundle from the provider metadata', () => {
    const metadata = makeProviderAdapterMetadata({
      providerId: 'openai',
      supportedFeatures: ['chat-completion', 'vision'],
    })

    expect(resolveProviderAdapterCapabilities(metadata)).toEqual({
      providerId: 'openai',
      supported: ['chat-completion', 'vision'],
    })
  })

  it('reflects a narrower capability set for a provider with fewer supported features', () => {
    const metadata = makeProviderAdapterMetadata({ providerId: 'local-llm', supportedFeatures: ['chat-completion'] })

    expect(resolveProviderAdapterCapabilities(metadata).supported).toEqual(['chat-completion'])
  })
})
