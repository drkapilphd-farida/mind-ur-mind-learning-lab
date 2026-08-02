import type { FailureSignal, RecoveryContext, RecoveryPlan } from '../types'

// One of the brief's own 10 named responsibilities — no naming
// collision found, used brief-exact. Composes `FailureClassifier` +
// `RetryDecisionResolver` + backoff computation + retry-budget
// evaluation + validation into one deterministic `RecoveryPlan`. Pure;
// never throws.
export interface RecoveryEngine {
  planRecovery(signal: FailureSignal, context: RecoveryContext): RecoveryPlan
}
