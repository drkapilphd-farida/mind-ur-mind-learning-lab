import type { RateLimitPolicy } from '../types'
import type { RateLimitDecision, RateLimiter } from '../types/RateLimiter'

type WindowEntry = {
  timestamp: number
  tokens: number
}

export type InMemoryRateLimiterOptions = {
  now?: () => Date
}

const WINDOW_MS = 60_000

// AI Foundation Layer™ — AIF-1. Real sliding-window enforcement of
// `RateLimitPolicy` — the existing provider layer declares this policy
// as configuration data but nothing enforces it today (confirmed by
// reading BaseProviderAdapter.ts — no rate-limit check anywhere).
// Request count is exact (one real acquired slot per call); token count
// is a pre-call estimate (real token counts aren't known until the
// provider responds) — disclosed the same way `RateLimiter`'s own type
// comment discloses it.
export class InMemoryRateLimiter implements RateLimiter {
  private readonly entries: WindowEntry[] = []
  private readonly now: () => Date

  constructor(
    private readonly policy: RateLimitPolicy,
    options: InMemoryRateLimiterOptions = {},
  ) {
    this.now = options.now ?? (() => new Date())
  }

  tryAcquire(estimatedTokens: number): RateLimitDecision {
    const nowMs = this.now().getTime()
    this.prune(nowMs)

    const requestCount = this.entries.length
    if (requestCount >= this.policy.maxRequestsPerMinute) {
      return {
        allowed: false,
        reason: `Request rate limit exceeded: ${this.policy.maxRequestsPerMinute} requests/minute.`,
        retryAfterMs: this.msUntilOldestExpires(nowMs),
      }
    }

    const tokenCount = this.entries.reduce((sum, entry) => sum + entry.tokens, 0)
    if (tokenCount + estimatedTokens > this.policy.maxTokensPerMinute) {
      return {
        allowed: false,
        reason: `Token rate limit exceeded: ${this.policy.maxTokensPerMinute} tokens/minute.`,
        retryAfterMs: this.msUntilOldestExpires(nowMs),
      }
    }

    this.entries.push({ timestamp: nowMs, tokens: estimatedTokens })
    return { allowed: true }
  }

  private prune(nowMs: number): void {
    while (this.entries.length > 0 && this.entries[0]!.timestamp <= nowMs - WINDOW_MS) {
      this.entries.shift()
    }
  }

  private msUntilOldestExpires(nowMs: number): number {
    const oldest = this.entries[0]
    if (!oldest) return WINDOW_MS
    return Math.max(0, oldest.timestamp + WINDOW_MS - nowMs)
  }
}

export function createInMemoryRateLimiter(policy: RateLimitPolicy, options: InMemoryRateLimiterOptions = {}): RateLimiter {
  return new InMemoryRateLimiter(policy, options)
}
