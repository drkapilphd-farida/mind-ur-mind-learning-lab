import type { RateLimitPolicy } from './RateLimitPolicy'
import type { RetryPolicy } from './RetryPolicy'

// Deliberately no credential/API-key field — "No API keys. No
// environment variables" is this sprint's explicit scope. A future
// real configuration loader would resolve credentials as a separate
// concern (e.g. reading from a secrets manager) and hand a fully-
// resolved client to a provider adapter; that resolution step doesn't
// exist anywhere in this feature.
export type AIProviderConfiguration = {
  providerId: string
  preferredModelId: string
  fallbackModelId?: string
  retryPolicy: RetryPolicy
  rateLimitPolicy: RateLimitPolicy
}
