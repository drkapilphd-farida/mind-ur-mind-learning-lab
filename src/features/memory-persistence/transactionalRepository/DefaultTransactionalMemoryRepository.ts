import type { Memory, MemoryId } from '../domain'
import type { MemorySpecification } from '../specification'
import type { IndexedMemoryRepository } from '../indexedRepository'
import { createIndexedMemoryRepository } from '../indexedRepository'
import type { IndexType, MemoryIndex } from '../indexDomain'
import type { IndexValidationResult } from '../indexValidation'
import type { IndexStatistics } from '../indexStatistics'
import type { MemoryTransaction, TransactionId, TransactionMetadata, TransactionOperation } from '../transactionDomain'
import type { TransactionValidationResult } from '../transactionValidation'
import type { TransactionAudit } from '../transactionAudit'
import type { TransactionCoordinator } from '../transactionCoordinator'
import { createTransactionCoordinator } from '../transactionCoordinator'
import type { TransactionalMemoryRepository } from './TransactionalMemoryRepository'

export type TransactionalMemoryRepositoryDependencies = {
  repository: IndexedMemoryRepository
  coordinator: TransactionCoordinator
}

// Implements TransactionalMemoryRepository via the Decorator pattern —
// wraps an *injected* IndexedMemoryRepository, delegating every
// inherited method to it unchanged ("no breaking interface changes"),
// and forwards every transactional method to an internally held
// TransactionCoordinator built against that exact same repository
// instance — so a transaction committed through this decorator writes
// through the same indexing/caching machinery any direct call would.
export class DefaultTransactionalMemoryRepository implements TransactionalMemoryRepository {
  constructor(private readonly dependencies: TransactionalMemoryRepositoryDependencies) {}

  async save(memory: Memory): Promise<void> {
    return this.dependencies.repository.save(memory)
  }

  async load(id: MemoryId): Promise<Memory | null> {
    return this.dependencies.repository.load(id)
  }

  async update(memory: Memory): Promise<void> {
    return this.dependencies.repository.update(memory)
  }

  async delete(id: MemoryId): Promise<void> {
    return this.dependencies.repository.delete(id)
  }

  async list(learnerId: string): Promise<readonly Memory[]> {
    return this.dependencies.repository.list(learnerId)
  }

  async query(specification: MemorySpecification, userId: string): Promise<readonly Memory[]> {
    return this.dependencies.repository.query(specification, userId)
  }

  getIndex(indexType: IndexType): MemoryIndex | null {
    return this.dependencies.repository.getIndex(indexType)
  }

  listIndexes(): readonly MemoryIndex[] {
    return this.dependencies.repository.listIndexes()
  }

  rebuildAllIndexes(memories: readonly Memory[]): void {
    this.dependencies.repository.rebuildAllIndexes(memories)
  }

  validateAllIndexes(memories: readonly Memory[]): ReadonlyMap<IndexType, IndexValidationResult> {
    return this.dependencies.repository.validateAllIndexes(memories)
  }

  getStatistics(indexType: IndexType, memories: readonly Memory[]): IndexStatistics | null {
    return this.dependencies.repository.getStatistics(indexType, memories)
  }

  beginTransaction(operations: readonly TransactionOperation[], metadata: TransactionMetadata): MemoryTransaction {
    return this.dependencies.coordinator.beginTransaction(operations, metadata)
  }

  async validateTransaction(transaction: MemoryTransaction): Promise<TransactionValidationResult> {
    return this.dependencies.coordinator.validateTransaction(transaction)
  }

  async commitTransaction(transaction: MemoryTransaction): Promise<MemoryTransaction> {
    return this.dependencies.coordinator.commitTransaction(transaction)
  }

  rollbackTransaction(transaction: MemoryTransaction): MemoryTransaction {
    return this.dependencies.coordinator.rollbackTransaction(transaction)
  }

  cancelTransaction(transaction: MemoryTransaction): MemoryTransaction {
    return this.dependencies.coordinator.cancelTransaction(transaction)
  }

  getAudit(transactionId: TransactionId): TransactionAudit | null {
    return this.dependencies.coordinator.getAudit(transactionId)
  }
}

export function createTransactionalMemoryRepository(
  repository: IndexedMemoryRepository = createIndexedMemoryRepository(),
  coordinator: TransactionCoordinator = createTransactionCoordinator(repository),
): TransactionalMemoryRepository {
  return new DefaultTransactionalMemoryRepository({ repository, coordinator })
}
