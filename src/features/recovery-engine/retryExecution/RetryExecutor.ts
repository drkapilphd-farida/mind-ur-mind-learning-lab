import type { RecoveryPlan, RetryExecutionResult, RetryOutcome } from '../types'

// One of the brief's own 10 named responsibilities. Never performs a
// real retry — takes a `RecoveryPlan` plus a deterministic,
// caller-supplied `RetryOutcome` (what actually happened) and reports
// the result. An `abort-execution` plan is never "executed."
export interface RetryExecutor {
  execute(plan: RecoveryPlan, outcome: RetryOutcome): RetryExecutionResult
}
