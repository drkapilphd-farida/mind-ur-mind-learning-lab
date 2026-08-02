import type { NormalizedProviderError } from './NormalizedProviderError'
import type { ProviderErrorCode } from './ProviderErrorCode'
import type { ProviderErrorNormalizer } from './ProviderErrorNormalizer'

// Classified by `error.name` rather than `instanceof` against a
// specific SDK's error classes — both the `openai` and
// `@anthropic-ai/sdk` packages name their error classes identically
// (`AuthenticationError`, `RateLimitError`, `APIConnectionTimeoutError`,
// `InternalServerError`, ...), so one name-based classification covers
// both without importing either SDK here. `MissingProviderConfigurationError`
// (this feature's own, thrown by EnvGatedProviderLifecycle) is handled
// the same way. Anything unrecognized becomes 'unknown-provider' —
// never a guess at what actually went wrong.
const ERROR_CODE_BY_NAME: Record<string, ProviderErrorCode> = {
  MissingProviderConfigurationError: 'configuration-error',
  AuthenticationError: 'authentication-error',
  PermissionDeniedError: 'authentication-error',
  RateLimitError: 'rate-limit',
  APIConnectionTimeoutError: 'timeout',
  APIConnectionError: 'unavailable-provider',
  InternalServerError: 'unavailable-provider',
}

const RETRYABLE_CODES = new Set<ProviderErrorCode>(['rate-limit', 'timeout', 'unavailable-provider'])

export class DefaultProviderErrorNormalizer implements ProviderErrorNormalizer {
  normalize(error: unknown, providerId: string): NormalizedProviderError {
    const isError = error instanceof Error
    const name = isError ? error.name : undefined
    const message = isError ? error.message : 'An unknown error occurred'
    const code: ProviderErrorCode = (name && ERROR_CODE_BY_NAME[name]) || 'unknown-provider'

    return { code, message, providerId, retryable: RETRYABLE_CODES.has(code) }
  }
}

export function createProviderErrorNormalizer(): ProviderErrorNormalizer {
  return new DefaultProviderErrorNormalizer()
}
