import { describe, expect, it } from 'vitest'
import { createProviderCredentialResolver } from './DefaultProviderCredentialResolver'
import { SUPPORTED_PROVIDERS } from '../catalog'

describe('DefaultProviderCredentialResolver', () => {
  it('reports no credentials for every supported provider — "No API keys" this sprint', () => {
    const resolver = createProviderCredentialResolver()
    for (const provider of SUPPORTED_PROVIDERS) {
      expect(resolver.hasCredentials(provider.id)).toBe(false)
    }
  })
})
