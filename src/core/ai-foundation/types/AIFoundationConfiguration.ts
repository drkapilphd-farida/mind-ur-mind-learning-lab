import { DEFAULT_RATE_LIMIT_POLICY, DEFAULT_RETRY_POLICY } from '@/features/ai-provider/configuration'
import type { RateLimitPolicy, RetryPolicy } from '@/features/ai-provider/types'

// AI Foundation Layer™ — AIF-1. Reuses the existing, real
// DEFAULT_RETRY_POLICY/DEFAULT_RATE_LIMIT_POLICY (@/features/ai-provider/
// configuration) rather than declaring new defaults — the only genuinely
// new configuration surface AIF-1 adds is `cacheTtlSeconds`, since
// nothing before this sprint cached AI results at all.
export type AIFoundationConfiguration = {
  retryPolicy: RetryPolicy
  rateLimitPolicy: RateLimitPolicy
  cacheTtlSeconds: number
}

const DEFAULT_CACHE_TTL_SECONDS = 86_400

// Reads `AI_FOUNDATION_CACHE_TTL_SECONDS` from the real environment
// (documented in .env.example) — falls back to a 24-hour default when
// unset or not a positive integer. Never throws on a malformed env var;
// an operator typo shouldn't take caching down, it should fall back to a
// safe, disclosed default.
export function loadAIFoundationConfiguration(): AIFoundationConfiguration {
  const rawTtl = process.env.AI_FOUNDATION_CACHE_TTL_SECONDS
  const parsedTtl = rawTtl !== undefined ? Number.parseInt(rawTtl, 10) : Number.NaN
  const cacheTtlSeconds = Number.isFinite(parsedTtl) && parsedTtl > 0 ? parsedTtl : DEFAULT_CACHE_TTL_SECONDS

  return {
    retryPolicy: DEFAULT_RETRY_POLICY,
    rateLimitPolicy: DEFAULT_RATE_LIMIT_POLICY,
    cacheTtlSeconds,
  }
}
