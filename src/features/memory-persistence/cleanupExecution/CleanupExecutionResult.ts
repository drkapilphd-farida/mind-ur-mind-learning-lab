import type { CleanupCandidate, CleanupPlan } from '../retentionDomain'
import type { MemoryTransaction } from '../transactionDomain'

// Immutable — every field `readonly`. `transaction` is whatever
// `TransactionCoordinator.commitTransaction()` returned (`committed`
// or `failed`, rollback already applied automatically on failure —
// see Sprint 17's `DefaultTransactionCoordinator.commitTransaction()`)
// — this feature never re-implements commit/rollback semantics, only
// consumes them.
export type CleanupExecutionResult = {
  readonly plan: CleanupPlan
  readonly transaction: MemoryTransaction
  readonly skipped: readonly CleanupCandidate[]
}
