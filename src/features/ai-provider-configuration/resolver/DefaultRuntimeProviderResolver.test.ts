import { describe, expect, it } from 'vitest'
import { createRuntimeProviderResolver } from './DefaultRuntimeProviderResolver'
import { makeAllDisabledFeatureFlags, makeProviderRegistryConfiguration } from '../testFixtures'
import type { ProviderConfigValidator, ProviderCredentialResolver, ProviderHealthChecker } from '../contracts'

describe('DefaultRuntimeProviderResolver', () => {
  it('resolves to mock by default, with a real, specific reason', async () => {
    const resolver = createRuntimeProviderResolver(makeProviderRegistryConfiguration())
    const resolved = await resolver.resolve()
    expect(resolved).toEqual({ providerId: 'mock', isMock: true, reason: 'mock is the configured active provider' })
  })

  it('falls back to mock when the configuration itself is invalid, explaining why', async () => {
    const invalidConfigValidator: ProviderConfigValidator = { validate: () => ({ valid: false, errors: ['bad config'] }) }
    const resolver = createRuntimeProviderResolver(makeProviderRegistryConfiguration(), { configValidator: invalidConfigValidator })
    const resolved = await resolver.resolve()
    expect(resolved.isMock).toBe(true)
    expect(resolved.reason).toContain('bad config')
  })

  it('with real default dependencies, a configured-but-unenabled real provider still falls back to mock', async () => {
    const config = makeProviderRegistryConfiguration({ activeProviderId: 'openai', featureFlags: makeAllDisabledFeatureFlags({ openai: true }) })
    const resolver = createRuntimeProviderResolver(config)
    const resolved = await resolver.resolve()
    expect(resolved.providerId).toBe('mock')
  })

  it('falls back to mock when the selected provider has no credentials (the honest, real default today)', async () => {
    const base = makeProviderRegistryConfiguration()
    const config = makeProviderRegistryConfiguration({
      activeProviderId: 'openai',
      providers: base.providers.map((provider) => (provider.id === 'openai' ? { ...provider, enabled: true } : provider)),
      featureFlags: makeAllDisabledFeatureFlags({ openai: true }),
    })
    const resolver = createRuntimeProviderResolver(config)
    const resolved = await resolver.resolve()
    expect(resolved.providerId).toBe('mock')
    expect(resolved.reason).toContain('no credentials')
  })

  it('falls back to mock when credentials exist but the provider is unhealthy', async () => {
    const base = makeProviderRegistryConfiguration()
    const config = makeProviderRegistryConfiguration({
      activeProviderId: 'openai',
      providers: base.providers.map((provider) => (provider.id === 'openai' ? { ...provider, enabled: true } : provider)),
      featureFlags: makeAllDisabledFeatureFlags({ openai: true }),
    })
    const credentialResolver: ProviderCredentialResolver = { hasCredentials: () => true }
    const resolver = createRuntimeProviderResolver(config, { credentialResolver })
    const resolved = await resolver.resolve()
    expect(resolved.providerId).toBe('mock')
    expect(resolved.reason).toContain('not currently healthy')
  })

  it('resolves to the real provider once it is enabled, flagged on, credentialed, AND healthy (proves the pipeline is ready for a future real provider)', async () => {
    const base = makeProviderRegistryConfiguration()
    const config = makeProviderRegistryConfiguration({
      activeProviderId: 'openai',
      providers: base.providers.map((provider) => (provider.id === 'openai' ? { ...provider, enabled: true } : provider)),
      featureFlags: makeAllDisabledFeatureFlags({ openai: true }),
    })
    const credentialResolver: ProviderCredentialResolver = { hasCredentials: () => true }
    const healthChecker: ProviderHealthChecker = {
      checkHealth: async (providerId) => ({ providerId, state: 'healthy', checkedAt: '2026-01-01T00:00:00.000Z' }),
    }
    const resolver = createRuntimeProviderResolver(config, { credentialResolver, healthChecker })
    const resolved = await resolver.resolve()
    expect(resolved).toEqual({ providerId: 'openai', isMock: false, reason: '"openai" is enabled, credentialed, and healthy' })
  })
})
