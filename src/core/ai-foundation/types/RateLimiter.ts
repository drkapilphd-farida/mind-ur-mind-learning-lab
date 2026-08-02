// AI Foundation Layer™ — AIF-1. Enforces `RateLimitPolicy`
// (@/features/ai-provider/types — reused, not redefined) — a real gap
// this sprint fills: the existing provider layer declares
// `RateLimitPolicy` as configuration data but nothing enforces it today.
// `estimatedTokens` is a pre-call estimate (see internal/
// executeWithRetry.ts's caller, which uses the existing, reused
// `estimateTokens()` from @/features/ai-provider/adapters) — a real
// token count isn't known until the provider responds, so token-based
// limiting is necessarily a pre-call approximation, never a fabricated
// exact count.
export type RateLimitDecision = { allowed: true } | { allowed: false; reason: string; retryAfterMs: number }

export interface RateLimiter {
  tryAcquire(estimatedTokens: number): RateLimitDecision
}
