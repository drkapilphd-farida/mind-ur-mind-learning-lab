import type { TransactionId } from '../transactionDomain'

// Thrown by DefaultTransactionCoordinator when, after a failed
// commit's automatic restore, `validateRollbackIntegrity()` reports
// the repository was *not* fully restored to its pre-transaction
// state — "No partial commits" violated. In this feature's
// deterministic in-memory repository this can only be reached by
// deliberately injecting a broken repository stub (real repositories
// always restore correctly), but the check itself is a real, load-
// bearing safety net for any future backing store.
export class RollbackIntegrityError extends Error {
  constructor(transactionId: TransactionId) {
    super(`Rollback integrity check failed for transaction "${transactionId}" — repository state was not fully restored.`)
    this.name = 'RollbackIntegrityError'
  }
}
