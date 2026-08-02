import type { MemoryTransaction, TransactionId, TransactionMetadata, TransactionOperation } from '../transactionDomain'
import type { TransactionValidationResult } from '../transactionValidation'
import type { TransactionAudit } from '../transactionAudit'

// "Begin transaction, Commit transaction, Rollback transaction, Cancel
// transaction, Validate transaction. No repository-specific business
// logic." — this interface only ever talks in terms of
// `MemoryTransaction`/operations/validation results; every actual
// repository call is delegated to the injected
// `BatchMemoryOperationExecutor` (Section 4) and `RollbackEngine`
// (Section 5). `getAudit` is this coordinator's diagnostics-only
// surface for Section 8 — populated by `commitTransaction`, the one
// place a validation result and a final state are both genuinely known
// together.
export interface TransactionCoordinator {
  beginTransaction(operations: readonly TransactionOperation[], metadata: TransactionMetadata): MemoryTransaction
  validateTransaction(transaction: MemoryTransaction): Promise<TransactionValidationResult>
  commitTransaction(transaction: MemoryTransaction): Promise<MemoryTransaction>
  rollbackTransaction(transaction: MemoryTransaction): MemoryTransaction
  cancelTransaction(transaction: MemoryTransaction): MemoryTransaction
  getAudit(transactionId: TransactionId): TransactionAudit | null
}
