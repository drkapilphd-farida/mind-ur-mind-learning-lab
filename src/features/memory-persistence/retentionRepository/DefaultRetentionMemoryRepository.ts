import type { Memory, MemoryId } from '../domain'
import type { MemorySpecification } from '../specification'
import type { IndexType, MemoryIndex } from '../indexDomain'
import type { IndexValidationResult } from '../indexValidation'
import type { IndexStatistics } from '../indexStatistics'
import type { MemoryTransaction, TransactionId, TransactionMetadata, TransactionOperation } from '../transactionDomain'
import type { TransactionValidationResult } from '../transactionValidation'
import type { TransactionAudit } from '../transactionAudit'
import type { RetentionMetadata } from '../retentionDomain'
import type { TransactionalMemoryRepository } from '../transactionalRepository'
import { createTransactionalMemoryRepository } from '../transactionalRepository'
import type { RetentionMemoryRepository } from './RetentionMemoryRepository'

export type RetentionMemoryRepositoryDependencies = {
  repository: TransactionalMemoryRepository
}

// Implements RetentionMemoryRepository via the Decorator pattern —
// wraps an *injected* TransactionalMemoryRepository, delegating every
// inherited method to it unchanged ("additive-only changes"), and adds
// one small piece of new state (a private retention-metadata map) that
// no earlier layer has any knowledge of or access to.
export class DefaultRetentionMemoryRepository implements RetentionMemoryRepository {
  private readonly retentionMetadata = new Map<MemoryId, RetentionMetadata>()

  constructor(private readonly dependencies: RetentionMemoryRepositoryDependencies) {}

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
    return this.dependencies.repository.beginTransaction(operations, metadata)
  }

  async validateTransaction(transaction: MemoryTransaction): Promise<TransactionValidationResult> {
    return this.dependencies.repository.validateTransaction(transaction)
  }

  async commitTransaction(transaction: MemoryTransaction): Promise<MemoryTransaction> {
    return this.dependencies.repository.commitTransaction(transaction)
  }

  rollbackTransaction(transaction: MemoryTransaction): MemoryTransaction {
    return this.dependencies.repository.rollbackTransaction(transaction)
  }

  cancelTransaction(transaction: MemoryTransaction): MemoryTransaction {
    return this.dependencies.repository.cancelTransaction(transaction)
  }

  getAudit(transactionId: TransactionId): TransactionAudit | null {
    return this.dependencies.repository.getAudit(transactionId)
  }

  async getRetentionMetadata(memoryId: MemoryId): Promise<RetentionMetadata | null> {
    return this.retentionMetadata.get(memoryId) ?? null
  }

  async setRetentionMetadata(metadata: RetentionMetadata): Promise<void> {
    this.retentionMetadata.set(metadata.memoryId, metadata)
  }
}

export function createRetentionMemoryRepository(
  repository: TransactionalMemoryRepository = createTransactionalMemoryRepository(),
): RetentionMemoryRepository {
  return new DefaultRetentionMemoryRepository({ repository })
}
