import type { RecoveryPlan } from './RecoveryPlan'

// Immutable — every field `readonly`. `RetryExecutor.execute()`'s own
// output. `executed` is `false` whenever `plan.strategy ===
// 'abort-execution'` — nothing further is ever attempted for an
// aborted plan.
export type RetryExecutionResult = {
  readonly executed: boolean
  readonly plan: RecoveryPlan
  readonly succeeded: boolean
  readonly responseText: string | null
}
