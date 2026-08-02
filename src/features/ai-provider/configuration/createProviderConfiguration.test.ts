import { describe, expect, it } from 'vitest'
import { createProviderConfiguration } from './createProviderConfiguration'
import { DEFAULT_RATE_LIMIT_POLICY, DEFAULT_RETRY_POLICY } from './defaultPolicies'

describe('createProviderConfiguration', () => {
  it('fills in default retry/rate-limit policies when not given', () => {
    const config = createProviderConfiguration({ providerId: 'acme', preferredModelId: 'acme-chat' })
    expect(config.retryPolicy).toBe(DEFAULT_RETRY_POLICY)
    expect(config.rateLimitPolicy).toBe(DEFAULT_RATE_LIMIT_POLICY)
  })

  it('omits fallbackModelId entirely when not given, rather than setting it to undefined', () => {
    const config = createProviderConfiguration({ providerId: 'acme', preferredModelId: 'acme-chat' })
    expect('fallbackModelId' in config).toBe(false)
  })

  it('passes through a given fallbackModelId', () => {
    const config = createProviderConfiguration({ providerId: 'acme', preferredModelId: 'acme-chat', fallbackModelId: 'acme-chat-lite' })
    expect(config.fallbackModelId).toBe('acme-chat-lite')
  })

  it('passes through explicitly given policies instead of the defaults', () => {
    const customRetry = { maxAttempts: 5, backoffStrategy: 'fixed' as const, baseDelayMs: 200 }
    const config = createProviderConfiguration({ providerId: 'acme', preferredModelId: 'acme-chat', retryPolicy: customRetry })
    expect(config.retryPolicy).toBe(customRetry)
  })
})
