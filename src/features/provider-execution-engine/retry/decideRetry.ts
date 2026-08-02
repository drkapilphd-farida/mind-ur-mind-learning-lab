import type { ExecutionRetryPolicy } from '../types'
import type { RetryDecision } from './RetryDecision'

// Pure — "Support deterministic retry ... No timers. No waiting. Only
// decision logic." `shouldRetry` is a pure comparison against
// `maxAttempts` — this function never waits, never schedules, never
// measures a backoff delay; a caller that wants to actually apply
// `backoffStrategy` timing is a future, out-of-scope concern.
export function decideRetry(attemptCount: number, policy: ExecutionRetryPolicy): RetryDecision {
  const shouldRetry = attemptCount < policy.maxAttempts

  return {
    shouldRetry,
    nextAttemptNumber: attemptCount + 1,
    reason: shouldRetry
      ? `Attempt ${attemptCount} of ${policy.maxAttempts} allows a retry.`
      : `Attempt ${attemptCount} reached the configured max of ${policy.maxAttempts}.`,
    metadata: { attemptCount, maxAttempts: policy.maxAttempts, backoffStrategy: policy.backoffStrategy },
  }
}
