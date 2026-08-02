import type { ErrorTranslator } from '@/features/ai-provider/contracts'
import type { AIError, AIErrorCode } from '@/features/ai-provider/types'
import type { ProviderErrorCode } from './ProviderErrorCode'
import type { ProviderErrorNormalizer } from './ProviderErrorNormalizer'
import { createProviderErrorNormalizer } from './DefaultProviderErrorNormalizer'

// Implements ai-provider's ErrorTranslator contract (Sprint 5, Chunk 3,
// unmodified) — the seam BaseProviderAdapter actually calls. Composes
// this feature's own richer ProviderErrorNormalizer, then maps its
// 6-category ProviderErrorCode down to Sprint 5's 6-value AIErrorCode.
// Five map directly; 'configuration-error' has no equivalent in the
// frozen AIErrorCode union, so it maps to 'invalid-request' — the
// closest honest fit (a missing/malformed configuration is, from
// BaseProviderAdapter's point of view, a request that can't be
// serviced as given). One translator class serves both
// OpenAIProviderAdapter and ClaudeProviderAdapter — Sprint 5's
// ErrorTranslator.translate(error, providerId) already takes the
// provider id per call, so nothing here needs to be provider-specific.
const AI_ERROR_CODE_BY_PROVIDER_ERROR_CODE: Record<ProviderErrorCode, AIErrorCode> = {
  'authentication-error': 'authentication-failed',
  'configuration-error': 'invalid-request',
  'rate-limit': 'rate-limited',
  'unavailable-provider': 'provider-unavailable',
  timeout: 'timeout',
  'unknown-provider': 'unknown',
}

export class RealProviderErrorTranslator implements ErrorTranslator {
  constructor(private readonly normalizer: ProviderErrorNormalizer = createProviderErrorNormalizer()) {}

  translate(error: unknown, providerId: string): AIError {
    const normalized = this.normalizer.normalize(error, providerId)
    return {
      code: AI_ERROR_CODE_BY_PROVIDER_ERROR_CODE[normalized.code],
      message: normalized.message,
      providerId: normalized.providerId,
      retryable: normalized.retryable,
    }
  }
}

export function createRealProviderErrorTranslator(normalizer?: ProviderErrorNormalizer): ErrorTranslator {
  return new RealProviderErrorTranslator(normalizer)
}
