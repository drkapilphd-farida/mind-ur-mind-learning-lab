import type { MemoryTransaction, TransactionId, TransactionMetadata, TransactionOperation } from '../transactionDomain'
import type { TransactionValidationResult } from '../transactionValidation'
import type { TransactionAudit } from '../transactionAudit'
import type { IndexedMemoryRepository } from '../indexedRepository'

// "Extend repository contracts to support transactional operations
// while preserving backward compatibility. No breaking interface
// changes." — every method inherited from IndexedMemoryRepository (and,
// transitively, QueryableMemoryRepository/MemoryRepository) keeps its
// exact existing contract and results unchanged; the transactional
// methods added here are pure pass-throughs to an internally held
// TransactionCoordinator, giving one public entry point for both plain
// CRUD and transactional operations without duplicating the
// coordinator's own logic.
export interface TransactionalMemoryRepository extends IndexedMemoryRepository {
  beginTransaction(operations: readonly TransactionOperation[], metadata: TransactionMetadata): MemoryTransaction
  validateTransaction(transaction: MemoryTransaction): Promise<TransactionValidationResult>
  commitTransaction(transaction: MemoryTransaction): Promise<MemoryTransaction>
  rollbackTransaction(transaction: MemoryTransaction): MemoryTransaction
  cancelTransaction(transaction: MemoryTransaction): MemoryTransaction
  getAudit(transactionId: TransactionId): TransactionAudit | null
}
