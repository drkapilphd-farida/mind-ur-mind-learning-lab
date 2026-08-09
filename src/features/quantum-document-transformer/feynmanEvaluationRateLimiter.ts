import { createInMemoryRateLimiter } from '@/core/ai-foundation/internal/InMemoryRateLimiter'
import type { RateLimiter } from '@/core/ai-foundation/types/RateLimiter'

// Per ENGINEERING_CONSTITUTION.md §17 ("Rate limiting is enforced per
// user per model per time window on all AI endpoints"). Mirrors
// quantum-mentor/selectionExplanationRateLimiter.ts's exact pattern: one
// createInMemoryRateLimiter instance per user, held in a module-level
// map for this server process's lifetime — same disclosed tradeoff
// (resets on deploy/restart, not shared across instances), acceptable
// for abuse/cost protection on a small, low-token call.
const POLICY = { maxRequestsPerMinute: 10, maxTokensPerMinute: 4_000 }

const limitersByUserId = new Map<string, RateLimiter>()

export function checkFeynmanEvaluationRateLimit(userId: string): { allowed: true } | { allowed: false; reason: string; retryAfterMs: number } {
  let limiter = limitersByUserId.get(userId)
  if (!limiter) {
    limiter = createInMemoryRateLimiter(POLICY)
    limitersByUserId.set(userId, limiter)
  }

  // Pre-call estimate covering the prompt plus a small (<=300 token)
  // structured tool-use reply — the real count isn't known until the
  // model responds, same tradeoff InMemoryRateLimiter's own doc comment
  // already discloses.
  return limiter.tryAcquire(700)
}
