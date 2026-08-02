import { describe, expect, it } from 'vitest'
import { createProviderRegistryConfiguration } from './createProviderRegistryConfiguration'
import { createInMemoryEnvironmentConfigSource } from '../environment'
import { SUPPORTED_PROVIDERS } from '../catalog'

describe('createProviderRegistryConfiguration', () => {
  it('defaults to mock with the full SUPPORTED_PROVIDERS catalog and every flag disabled', () => {
    const config = createProviderRegistryConfiguration()
    expect(config.activeProviderId).toBe('mock')
    expect(config.providers).toBe(SUPPORTED_PROVIDERS)
    expect(Object.values(config.featureFlags).every((flag) => flag === false)).toBe(true)
  })

  it('reflects an injected EnvironmentConfigSource', () => {
    const environmentConfigSource = createInMemoryEnvironmentConfigSource({ activeProviderId: 'claude', featureFlags: { claude: true } })
    const config = createProviderRegistryConfiguration({ environmentConfigSource })
    expect(config.activeProviderId).toBe('claude')
    expect(config.featureFlags.claude).toBe(true)
  })
})
