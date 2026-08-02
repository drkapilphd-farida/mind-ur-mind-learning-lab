import { describe, expect, it } from 'vitest'
import { createProviderValidator } from './DefaultProviderValidator'
import { createMockAIProvider } from '../adapters'
import { makeAIModel, makeProviderConfiguration, makeProviderMetadata } from '../testFixtures'

describe('DefaultProviderValidator', () => {
  const validator = createProviderValidator()

  describe('validateConfiguration', () => {
    it('accepts a well-formed configuration', () => {
      expect(validator.validateConfiguration(makeProviderConfiguration())).toEqual({ valid: true, errors: [] })
    })

    it('rejects an empty providerId', () => {
      const result = validator.validateConfiguration(makeProviderConfiguration({ providerId: '  ' }))
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('providerId must not be empty')
    })

    it('rejects an empty preferredModelId', () => {
      const result = validator.validateConfiguration(makeProviderConfiguration({ preferredModelId: '' }))
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('preferredModelId must not be empty')
    })

    it('rejects retryPolicy.maxAttempts below 1', () => {
      const result = validator.validateConfiguration(
        makeProviderConfiguration({ retryPolicy: { maxAttempts: 0, backoffStrategy: 'fixed', baseDelayMs: 100 } }),
      )
      expect(result.errors).toContain('retryPolicy.maxAttempts must be at least 1')
    })

    it('rejects a negative retryPolicy.baseDelayMs', () => {
      const result = validator.validateConfiguration(
        makeProviderConfiguration({ retryPolicy: { maxAttempts: 3, backoffStrategy: 'fixed', baseDelayMs: -1 } }),
      )
      expect(result.errors).toContain('retryPolicy.baseDelayMs must not be negative')
    })

    it('rejects non-positive rateLimitPolicy values', () => {
      const result = validator.validateConfiguration(
        makeProviderConfiguration({ rateLimitPolicy: { maxRequestsPerMinute: 0, maxTokensPerMinute: 0 } }),
      )
      expect(result.errors).toContain('rateLimitPolicy.maxRequestsPerMinute must be at least 1')
      expect(result.errors).toContain('rateLimitPolicy.maxTokensPerMinute must be at least 1')
    })

    it('collects every violation at once, not just the first', () => {
      const result = validator.validateConfiguration(
        makeProviderConfiguration({ providerId: '', preferredModelId: '', retryPolicy: { maxAttempts: 0, backoffStrategy: 'fixed', baseDelayMs: -1 } }),
      )
      expect(result.errors.length).toBeGreaterThanOrEqual(3)
    })
  })

  describe('validateProvider', () => {
    it('accepts a well-formed provider', () => {
      const provider = createMockAIProvider({ metadata: makeProviderMetadata({ id: 'acme' }), models: [makeAIModel({ id: 'acme-chat', providerId: 'acme' })] })
      expect(validator.validateProvider(provider)).toEqual({ valid: true, errors: [] })
    })

    it('rejects a provider with zero models', () => {
      const provider = createMockAIProvider({ metadata: makeProviderMetadata({ id: 'acme' }), models: [] })
      const result = validator.validateProvider(provider)
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('provider "acme" must declare at least one model')
    })

    it('rejects a model whose providerId does not match its own provider', () => {
      const provider = createMockAIProvider({ metadata: makeProviderMetadata({ id: 'acme' }), models: [makeAIModel({ id: 'stray-model', providerId: 'someone-else' })] })
      const result = validator.validateProvider(provider)
      expect(result.valid).toBe(false)
      expect(result.errors.some((error) => error.includes('stray-model'))).toBe(true)
    })

    it('rejects duplicate model ids within the same provider', () => {
      const provider = createMockAIProvider({
        metadata: makeProviderMetadata({ id: 'acme' }),
        models: [makeAIModel({ id: 'dup', providerId: 'acme' }), makeAIModel({ id: 'dup', providerId: 'acme' })],
      })
      const result = validator.validateProvider(provider)
      expect(result.valid).toBe(false)
      expect(result.errors.some((error) => error.includes('duplicate model ids'))).toBe(true)
    })
  })
})
