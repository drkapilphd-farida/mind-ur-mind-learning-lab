import type { RetryEligibilityPolicy } from '../types'
import type { RetryEligibilityDecision } from './RetryEligibilityDecision'

// Pure — "retry eligibility" (§ Responsibilities). No timers, no
// waiting — a plain comparison against the configured max.
export function decideRetryEligibility(attemptCount: number, policy: RetryEligibilityPolicy): RetryEligibilityDecision {
  const eligible = attemptCount < policy.maxAttempts

  return {
    eligible,
    reason: eligible
      ? `Attempt ${attemptCount} of ${policy.maxAttempts} is eligible for retry.`
      : `Attempt ${attemptCount} has reached the configured max of ${policy.maxAttempts}.`,
  }
}
