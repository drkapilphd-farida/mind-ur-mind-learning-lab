import { describe, expect, it } from 'vitest'
import { createRealProviderErrorTranslator } from './RealProviderErrorTranslator'

function namedError(name: string, message = 'boom'): Error {
  const error = new Error(message)
  error.name = name
  return error
}

describe('RealProviderErrorTranslator', () => {
  const translator = createRealProviderErrorTranslator()

  it('maps configuration-error down to invalid-request (the closest Sprint 5 AIErrorCode)', () => {
    const result = translator.translate(namedError('MissingProviderConfigurationError'), 'openai')
    expect(result.code).toBe('invalid-request')
  })

  it('maps authentication-error down to authentication-failed', () => {
    expect(translator.translate(namedError('AuthenticationError'), 'openai').code).toBe('authentication-failed')
  })

  it('maps rate-limit down to rate-limited', () => {
    expect(translator.translate(namedError('RateLimitError'), 'openai').code).toBe('rate-limited')
  })

  it('maps unavailable-provider down to provider-unavailable', () => {
    expect(translator.translate(namedError('APIConnectionError'), 'openai').code).toBe('provider-unavailable')
  })

  it('maps timeout down to timeout', () => {
    expect(translator.translate(namedError('APIConnectionTimeoutError'), 'openai').code).toBe('timeout')
  })

  it('maps unknown-provider down to unknown', () => {
    expect(translator.translate(namedError('SomethingElse'), 'openai').code).toBe('unknown')
  })

  it('produces a real ai-provider AIError shape (code, message, providerId, retryable)', () => {
    const result = translator.translate(namedError('RateLimitError', 'slow down'), 'claude')
    expect(result).toEqual({ code: 'rate-limited', message: 'slow down', providerId: 'claude', retryable: true })
  })
})
