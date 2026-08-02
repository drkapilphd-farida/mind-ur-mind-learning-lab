import type { FailureCategory, RecoveryContext, RecoveryStrategyType } from '../types'

// One of the brief's own 10 named responsibilities. Pure — maps
// `(FailureCategory, RecoveryContext)` to one of the 5 named
// `RecoveryStrategy` values.
export interface RetryDecisionResolver {
  resolve(category: FailureCategory, context: RecoveryContext): RecoveryStrategyType
}
