import type { RecoveryStrategyType } from './RecoveryStrategy'
import type { RetryBudgetStatus } from './RetryBudgetStatus'

// Immutable — every field `readonly`. One of the brief's own 10 named
// responsibilities — `RecoveryEngine.planRecovery()`'s own output.
// `targetProviderId`/`targetModelId` are populated only when the
// strategy actually names a different target
// (`retry-alternate-provider`/`retry-alternate-model`/
// `execute-fallback`); `backoffDelayMs` only when a retry is planned.
export type RecoveryPlan = {
  readonly strategy: RecoveryStrategyType
  readonly reason: string
  readonly backoffDelayMs: number | null
  readonly targetProviderId: string | null
  readonly targetModelId: string | null
  readonly retryBudgetStatus: RetryBudgetStatus
}
