import { describe, expect, it } from 'vitest'
import { createProviderConfigValidator } from './DefaultProviderConfigValidator'
import { makeProviderRegistryConfiguration } from '../testFixtures'

describe('DefaultProviderConfigValidator', () => {
  const validator = createProviderConfigValidator()

  it('accepts a well-formed configuration', () => {
    expect(validator.validate(makeProviderRegistryConfiguration())).toEqual({ valid: true, errors: [] })
  })

  it('accepts an activeProviderId that is a real, configured provider', () => {
    const config = makeProviderRegistryConfiguration({ activeProviderId: 'openai' })
    expect(validator.validate(config).valid).toBe(true)
  })

  it('rejects duplicate provider ids', () => {
    const config = makeProviderRegistryConfiguration({ providers: [...makeProviderRegistryConfiguration().providers, { id: 'openai', displayName: 'Dup', enabled: false, requiresApiKey: true }] })
    const result = validator.validate(config)
    expect(result.valid).toBe(false)
    expect(result.errors.some((error) => error.includes('duplicate'))).toBe(true)
  })

  it('rejects an activeProviderId that is not among the configured providers', () => {
    const config = makeProviderRegistryConfiguration({ activeProviderId: 'openai', providers: [] })
    const result = validator.validate(config)
    expect(result.valid).toBe(false)
    expect(result.errors.some((error) => error.includes('activeProviderId'))).toBe(true)
  })

  it('rejects a provider with no featureFlags entry', () => {
    const base = makeProviderRegistryConfiguration()
    const { openai: _omitted, ...remainingFlags } = base.featureFlags
    const config = { ...base, featureFlags: remainingFlags } as typeof base
    const result = validator.validate(config)
    expect(result.valid).toBe(false)
    expect(result.errors.some((error) => error.includes('featureFlags'))).toBe(true)
  })
})
