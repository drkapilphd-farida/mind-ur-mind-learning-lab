import type { ExecutionBackoffStrategy } from './ExecutionBackoffStrategy'

// Renamed from the brief's own literal "RetryPolicy" — that exact name
// already exists at `@/features/ai-provider/types/RetryPolicy.ts`
// (Sprint 5), a *different* shape (`{maxAttempts, backoffStrategy:
// 'fixed'|'exponential', baseDelayMs}`, no `'immediate'` option) tied
// to real provider retry, a different concern this sprint deliberately
// doesn't couple to. Renamed rather than reused, same fix as
// `MentorContext`→`MentorPersonalizationContext` (Sprint 28). Its two
// siblings (`ExecutionTimeoutPolicy`/`ExecutionCancellationPolicy`) got
// the same prefix for family-naming consistency, even though only this
// one literally collided.
export type ExecutionRetryPolicy = {
  readonly maxAttempts: number
  readonly backoffStrategy: ExecutionBackoffStrategy
}
