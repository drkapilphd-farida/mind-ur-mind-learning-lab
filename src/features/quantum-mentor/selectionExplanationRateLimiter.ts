import { createInMemoryRateLimiter } from '@/core/ai-foundation/internal/InMemoryRateLimiter'
import type { RateLimiter } from '@/core/ai-foundation/types/RateLimiter'

// Per ENGINEERING_CONSTITUTION.md §17 ("Rate limiting is enforced per user
// per model per time window on all AI endpoints"). This endpoint fires on
// ordinary reading interaction (one call per highlighted selection) far
// more often than the document-transformer's own upload flow, so it's the
// one call site in this bypass-AIFoundation family that genuinely needs
// its own enforcement rather than relying on an unrelated limit (like the
// transformer's free-tier document count) to bound call frequency.
//
// Reuses AIFoundation's own real `InMemoryRateLimiter` rather than
// reimplementing sliding-window logic — one limiter instance per user,
// held in a module-level map for this server process's lifetime. Per-user
// in-memory state is the same disclosed tradeoff AIFoundation's own
// limiter already carries (resets on deploy/restart, not shared across
// instances) — acceptable here for the same reason: this is abuse/cost
// protection, not a billing-accurate ledger.
const POLICY = { maxRequestsPerMinute: 12, maxTokensPerMinute: 6_000 }

const limitersByUserId = new Map<string, RateLimiter>()

export function checkSelectionExplanationRateLimit(userId: string): { allowed: true } | { allowed: false; reason: string; retryAfterMs: number } {
  let limiter = limitersByUserId.get(userId)
  if (!limiter) {
    limiter = createInMemoryRateLimiter(POLICY)
    limitersByUserId.set(userId, limiter)
  }

  // The real per-call token count isn't known until the model responds
  // (same disclosed tradeoff as InMemoryRateLimiter's own doc comment) —
  // this is a fixed pre-call estimate covering the prompt plus a ~500
  // output-token reply.
  return limiter.tryAcquire(1_200)
}
