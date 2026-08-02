import type { RateLimitPolicy, RetryPolicy } from '../types'

// Sensible, conservative defaults — real values a real provider
// integration would tune per-provider later. Named constants so every
// caller starts from the same baseline instead of each inventing its
// own numbers.
export const DEFAULT_RETRY_POLICY: RetryPolicy = {
  maxAttempts: 3,
  backoffStrategy: 'exponential',
  baseDelayMs: 500,
}

export const DEFAULT_RATE_LIMIT_POLICY: RateLimitPolicy = {
  maxRequestsPerMinute: 60,
  maxTokensPerMinute: 100_000,
}
