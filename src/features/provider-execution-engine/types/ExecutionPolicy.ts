import type { ExecutionCancellationPolicy } from './ExecutionCancellationPolicy'
import type { ExecutionRetryPolicy } from './ExecutionRetryPolicy'
import type { ExecutionTimeoutPolicy } from './ExecutionTimeoutPolicy'

// Immutable — every field `readonly`. No literal name collision
// (confirmed via repo-wide grep), unlike its 3 sub-policies — bundles
// them together, one policy set per execution session.
export type ExecutionPolicy = {
  readonly retryPolicy: ExecutionRetryPolicy
  readonly timeoutPolicy: ExecutionTimeoutPolicy
  readonly cancellationPolicy: ExecutionCancellationPolicy
}
