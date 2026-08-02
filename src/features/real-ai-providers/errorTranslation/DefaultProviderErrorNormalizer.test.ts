import { describe, expect, it } from 'vitest'
import { createProviderErrorNormalizer } from './DefaultProviderErrorNormalizer'
import { MissingProviderConfigurationError } from '../errors'

function namedError(name: string, message = 'boom'): Error {
  const error = new Error(message)
  error.name = name
  return error
}

describe('DefaultProviderErrorNormalizer', () => {
  const normalizer = createProviderErrorNormalizer()

  it('normalizes MissingProviderConfigurationError to configuration-error, non-retryable', () => {
    const result = normalizer.normalize(new MissingProviderConfigurationError('openai', 'OPENAI_API_KEY'), 'openai')
    expect(result.code).toBe('configuration-error')
    expect(result.retryable).toBe(false)
  })

  it('normalizes AuthenticationError to authentication-error, non-retryable', () => {
    const result = normalizer.normalize(namedError('AuthenticationError'), 'openai')
    expect(result.code).toBe('authentication-error')
    expect(result.retryable).toBe(false)
  })

  it('normalizes PermissionDeniedError to authentication-error', () => {
    expect(normalizer.normalize(namedError('PermissionDeniedError'), 'openai').code).toBe('authentication-error')
  })

  it('normalizes RateLimitError to rate-limit, retryable', () => {
    const result = normalizer.normalize(namedError('RateLimitError'), 'openai')
    expect(result.code).toBe('rate-limit')
    expect(result.retryable).toBe(true)
  })

  it('normalizes APIConnectionTimeoutError to timeout, retryable', () => {
    const result = normalizer.normalize(namedError('APIConnectionTimeoutError'), 'claude')
    expect(result.code).toBe('timeout')
    expect(result.retryable).toBe(true)
  })

  it('normalizes APIConnectionError to unavailable-provider, retryable', () => {
    expect(normalizer.normalize(namedError('APIConnectionError'), 'claude').code).toBe('unavailable-provider')
  })

  it('normalizes InternalServerError to unavailable-provider, retryable', () => {
    const result = normalizer.normalize(namedError('InternalServerError'), 'claude')
    expect(result.code).toBe('unavailable-provider')
    expect(result.retryable).toBe(true)
  })

  it('normalizes an unrecognized error name to unknown-provider, non-retryable', () => {
    const result = normalizer.normalize(namedError('SomeRandomError'), 'openai')
    expect(result.code).toBe('unknown-provider')
    expect(result.retryable).toBe(false)
  })

  it('normalizes a non-Error thrown value to unknown-provider without crashing', () => {
    const result = normalizer.normalize('a string was thrown', 'openai')
    expect(result.code).toBe('unknown-provider')
  })

  it('always sets providerId to the given providerId', () => {
    expect(normalizer.normalize(namedError('RateLimitError'), 'claude').providerId).toBe('claude')
  })

  it('preserves the original error message', () => {
    expect(normalizer.normalize(namedError('RateLimitError', 'Too many requests'), 'openai').message).toBe('Too many requests')
  })
})
