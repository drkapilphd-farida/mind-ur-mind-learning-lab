import type { AIError } from '../types'
import type { ErrorTranslator } from '../contracts'
import { UnknownModelError } from '../adapters'
import { InvalidRequestError } from './InvalidRequestError'
import { ProviderNotInitializedError } from './ProviderNotInitializedError'

// Implements ErrorTranslator. Every known local error class maps to a
// specific, meaningful AIErrorCode + retryable flag; anything else
// (a plain Error, or a non-Error thrown value) becomes 'unknown' and
// non-retryable rather than crashing the translator itself.
export class DefaultErrorTranslator implements ErrorTranslator {
  translate(error: unknown, providerId: string): AIError {
    if (error instanceof ProviderNotInitializedError) {
      return { code: 'provider-unavailable', message: error.message, providerId, retryable: true }
    }
    if (error instanceof UnknownModelError || error instanceof InvalidRequestError) {
      return { code: 'invalid-request', message: error.message, providerId, retryable: false }
    }
    if (error instanceof Error) {
      return { code: 'unknown', message: error.message, providerId, retryable: false }
    }
    return { code: 'unknown', message: 'An unknown error occurred', providerId, retryable: false }
  }
}

export function createErrorTranslator(): ErrorTranslator {
  return new DefaultErrorTranslator()
}
