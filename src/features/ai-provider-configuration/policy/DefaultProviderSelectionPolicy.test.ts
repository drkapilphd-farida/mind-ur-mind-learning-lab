import { describe, expect, it } from 'vitest'
import { createProviderSelectionPolicy } from './DefaultProviderSelectionPolicy'
import { makeAllDisabledFeatureFlags, makeProviderRegistryConfiguration } from '../testFixtures'

describe('DefaultProviderSelectionPolicy', () => {
  const policy = createProviderSelectionPolicy()

  it('returns mock immediately when activeProviderId is mock', () => {
    expect(policy.selectActiveProviderId(makeProviderRegistryConfiguration({ activeProviderId: 'mock' }))).toBe('mock')
  })

  it('falls back to mock when the requested provider entry is disabled', () => {
    const config = makeProviderRegistryConfiguration({
      activeProviderId: 'openai',
      featureFlags: makeAllDisabledFeatureFlags({ openai: true }),
    })
    expect(policy.selectActiveProviderId(config)).toBe('mock')
  })

  it('falls back to mock when the requested provider’s feature flag is off, even if enabled: true', () => {
    const base = makeProviderRegistryConfiguration()
    const config = makeProviderRegistryConfiguration({
      activeProviderId: 'openai',
      providers: base.providers.map((provider) => (provider.id === 'openai' ? { ...provider, enabled: true } : provider)),
      featureFlags: makeAllDisabledFeatureFlags(),
    })
    expect(policy.selectActiveProviderId(config)).toBe('mock')
  })

  it('falls back to mock when the requested provider id has no matching entry at all', () => {
    const config = makeProviderRegistryConfiguration({ activeProviderId: 'openai', providers: [] })
    expect(policy.selectActiveProviderId(config)).toBe('mock')
  })

  it('selects the requested provider when it is both enabled and feature-flagged on', () => {
    const base = makeProviderRegistryConfiguration()
    const config = makeProviderRegistryConfiguration({
      activeProviderId: 'openai',
      providers: base.providers.map((provider) => (provider.id === 'openai' ? { ...provider, enabled: true } : provider)),
      featureFlags: makeAllDisabledFeatureFlags({ openai: true }),
    })
    expect(policy.selectActiveProviderId(config)).toBe('openai')
  })
})
