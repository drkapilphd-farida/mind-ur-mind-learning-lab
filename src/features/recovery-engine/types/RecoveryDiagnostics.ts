import type { FailureCategory } from './FailureCategory'
import type { RecoveryStrategyType } from './RecoveryStrategy'
import type { RecoveryValidation } from './RecoveryValidation'
import type { RetryBudgetStatus } from './RetryBudgetStatus'

// Immutable — every field `readonly`. One of the brief's own 10 named
// responsibilities — no naming collision found, used brief-exact.
export type RecoveryDiagnostics = {
  readonly providerId: string
  readonly failureCategory: FailureCategory
  readonly strategy: RecoveryStrategyType
  readonly reason: string
  readonly attemptCount: number
  readonly backoffDelayMs: number | null
  readonly retryBudgetStatus: RetryBudgetStatus
  readonly validationResult: RecoveryValidation
}
