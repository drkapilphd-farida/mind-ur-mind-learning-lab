import { createInMemoryRateLimiter } from '@/core/ai-foundation/internal/InMemoryRateLimiter'
import type { RateLimiter } from '@/core/ai-foundation/types/RateLimiter'

// Per ENGINEERING_CONSTITUTION.md §17 ("Rate limiting is enforced per
// user per model per time window on all AI endpoints") — mirrors
// selectionExplanationRateLimiter.ts's own pattern exactly, reusing
// AIFoundation's real InMemoryRateLimiter rather than a second
// implementation. A document transformation is a much heavier, rarer
// call than a text-selection explanation (a full extraction + one large
// Claude call vs. one short one), so the policy is proportionally
// tighter — this exists to blunt a scripted upload flood, not to
// constrain a real user's normal pace (the free-tier document count in
// the route itself is the actual usage cap for free accounts).
// maxTokensPerMinute must comfortably clear maxRequestsPerMinute × the
// per-call estimate below (5 × 15,000 = 75,000) — otherwise the token
// budget silently becomes the binding constraint instead of the request
// count, capping real throughput below the intended 5/minute. Live
// testing caught exactly this with an earlier 40,000 value (it capped
// at 2 requests, not 5) before this was corrected.
const POLICY = { maxRequestsPerMinute: 5, maxTokensPerMinute: 80_000 }

const limitersByUserId = new Map<string, RateLimiter>()

export function checkTransformRateLimit(userId: string): { allowed: true } | { allowed: false; reason: string; retryAfterMs: number } {
  let limiter = limitersByUserId.get(userId)
  if (!limiter) {
    limiter = createInMemoryRateLimiter(POLICY)
    limitersByUserId.set(userId, limiter)
  }

  // Pre-call estimate covering a large document's extraction prompt plus
  // the structured JSON reply (summary/spider notes/quiz/etc.) —
  // deliberately generous, since underestimating would let a burst of
  // large documents through unthrottled.
  return limiter.tryAcquire(15_000)
}
