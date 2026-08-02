import { describe, expect, it } from 'vitest'
import { createErrorTranslator } from './DefaultErrorTranslator'
import { InvalidRequestError } from './InvalidRequestError'
import { ProviderNotInitializedError } from './ProviderNotInitializedError'
import { UnknownModelError } from '../adapters'

describe('DefaultErrorTranslator', () => {
  const translator = createErrorTranslator()

  it('translates ProviderNotInitializedError to provider-unavailable, retryable', () => {
    const result = translator.translate(new ProviderNotInitializedError('acme'), 'acme')
    expect(result).toEqual({ code: 'provider-unavailable', message: expect.stringContaining('acme'), providerId: 'acme', retryable: true })
  })

  it('translates UnknownModelError to invalid-request, non-retryable', () => {
    const result = translator.translate(new UnknownModelError('acme', 'missing-model'), 'acme')
    expect(result.code).toBe('invalid-request')
    expect(result.retryable).toBe(false)
  })

  it('translates InvalidRequestError to invalid-request, non-retryable', () => {
    const result = translator.translate(new InvalidRequestError('bad request'), 'acme')
    expect(result.code).toBe('invalid-request')
    expect(result.retryable).toBe(false)
  })

  it('translates a generic Error to unknown, non-retryable, preserving its message', () => {
    const result = translator.translate(new Error('boom'), 'acme')
    expect(result).toEqual({ code: 'unknown', message: 'boom', providerId: 'acme', retryable: false })
  })

  it('translates a non-Error thrown value to unknown without crashing', () => {
    const result = translator.translate('a string was thrown', 'acme')
    expect(result.code).toBe('unknown')
    expect(result.providerId).toBe('acme')
  })

  it('always sets providerId to the given providerId, regardless of error type', () => {
    const result = translator.translate(new Error('boom'), 'zenith')
    expect(result.providerId).toBe('zenith')
  })
})
