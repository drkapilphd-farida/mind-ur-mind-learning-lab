import type { CancellationEligibilityPolicy } from './CancellationEligibilityPolicy'
import type { ExecutionConstraints } from './ExecutionConstraints'
import type { FallbackEligibilityPolicy } from './FallbackEligibilityPolicy'
import type { RetryEligibilityPolicy } from './RetryEligibilityPolicy'
import type { TimeoutResolutionPolicy } from './TimeoutResolutionPolicy'

// Immutable — every field `readonly`. The raw policy configuration
// `ExecutionPolicyResolver` validates and, if valid, wraps into an
// `ExecutionPolicyEngine`.
export type ExecutionPolicyConfig = {
  readonly retryPolicy: RetryEligibilityPolicy
  readonly timeoutPolicy: TimeoutResolutionPolicy
  readonly cancellationPolicy: CancellationEligibilityPolicy
  readonly fallbackPolicy: FallbackEligibilityPolicy
  readonly constraints: ExecutionConstraints
}
