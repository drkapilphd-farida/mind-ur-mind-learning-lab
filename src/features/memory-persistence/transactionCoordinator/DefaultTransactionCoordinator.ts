import type { Clock, IdGenerator, MemoryRepository } from '../contracts'
import { randomIdGenerator, systemClock } from '../adapters'
import type { MemoryTransaction, TransactionId, TransactionMetadata, TransactionOperation } from '../transactionDomain'
import {
  moveTransactionToCommitted,
  moveTransactionToFailed,
  moveTransactionToPending,
  moveTransactionToRolledBack,
} from '../transactionLifecycle'
import type { TransactionValidationResult } from '../transactionValidation'
import { validateTransaction } from '../transactionValidation'
import type { BatchMemoryOperationExecutor } from '../batchOperations'
import { createBatchMemoryOperationExecutor } from '../batchOperations'
import type { RollbackEngine } from '../rollbackEngine'
import { createRollbackEngine, RollbackIntegrityError } from '../rollbackEngine'
import type { TransactionAudit } from '../transactionAudit'
import { buildTransactionAudit } from '../transactionAudit'
import type { TransactionCoordinator } from './TransactionCoordinator'

export type TransactionCoordinatorDependencies = {
  repository: MemoryRepository
  executor: BatchMemoryOperationExecutor
  rollbackEngine: RollbackEngine
  clock: Clock
  idGenerator: IdGenerator
}

function createDefaultDependencies(repository: MemoryRepository): TransactionCoordinatorDependencies {
  return {
    repository,
    executor: createBatchMemoryOperationExecutor(repository),
    rollbackEngine: createRollbackEngine(repository),
    clock: systemClock,
    idGenerator: randomIdGenerator,
  }
}

// Implements TransactionCoordinator — composes every other piece this
// sprint built (validation, batch execution, rollback) around the
// injected `MemoryRepository`-shaped dependency, without itself
// containing any repository-specific business logic: it never reads
// or writes a `Memory` field directly, only ever calling through
// `executor`/`rollbackEngine`/`validateTransaction`.
export class DefaultTransactionCoordinator implements TransactionCoordinator {
  private readonly auditLog = new Map<TransactionId, TransactionAudit>()

  constructor(private readonly dependencies: TransactionCoordinatorDependencies) {}

  beginTransaction(operations: readonly TransactionOperation[], metadata: TransactionMetadata): MemoryTransaction {
    const now = this.dependencies.clock.now()
    return {
      id: this.dependencies.idGenerator.generate(),
      state: 'created',
      operations,
      metadata,
      createdAt: now,
      updatedAt: now,
    }
  }

  async validateTransaction(transaction: MemoryTransaction): Promise<TransactionValidationResult> {
    return validateTransaction(transaction, this.dependencies.repository)
  }

  // "All-or-nothing execution semantics... No partial commits."
  // created -> pending -> (validate) -> (capture a before-snapshot) ->
  // (apply every operation) -> committed. Any failure along the way —
  // a failed validation, or an operation throwing mid-batch — lands on
  // `failed`, and in the mid-batch case the Rollback Engine restores
  // the repository to exactly its pre-attempt state *before* that
  // transition, so a caller observing `failed` never sees partially
  // applied data.
  async commitTransaction(transaction: MemoryTransaction): Promise<MemoryTransaction> {
    const now = this.dependencies.clock.now()
    const pending = moveTransactionToPending(transaction, now)

    const validationResult = await this.validateTransaction(pending)
    if (!validationResult.valid) {
      const failed = moveTransactionToFailed(pending, this.dependencies.clock.now())
      this.recordAudit(failed, validationResult)
      return failed
    }

    const snapshot = await this.dependencies.rollbackEngine.captureSnapshot(pending.operations)

    try {
      for (const operation of pending.operations) {
        await this.dependencies.executor.apply(operation)
      }
    } catch {
      await this.dependencies.rollbackEngine.restoreSnapshot(snapshot)

      const integrityOk = await this.dependencies.rollbackEngine.validateRollbackIntegrity(snapshot)
      if (!integrityOk) throw new RollbackIntegrityError(pending.id)

      const failed = moveTransactionToFailed(pending, this.dependencies.clock.now())
      this.recordAudit(failed, validationResult)
      return failed
    }

    const committed = moveTransactionToCommitted(pending, this.dependencies.clock.now())
    this.recordAudit(committed, validationResult)
    return committed
  }

  // A direct state transition only — by the time a caller observes a
  // `failed` transaction, `commitTransaction` has *already* restored
  // the repository via the Rollback Engine; this finalizes the
  // acknowledgment (`failed` -> `rolledBack`).
  rollbackTransaction(transaction: MemoryTransaction): MemoryTransaction {
    return moveTransactionToRolledBack(transaction, this.dependencies.clock.now())
  }

  // "Cancel transaction" — abandons a transaction that never reached
  // (or never finished) commit; nothing was ever applied to the
  // repository, so — like `rollbackTransaction` — this is a direct
  // state transition with no data to restore.
  cancelTransaction(transaction: MemoryTransaction): MemoryTransaction {
    return moveTransactionToRolledBack(transaction, this.dependencies.clock.now())
  }

  getAudit(transactionId: TransactionId): TransactionAudit | null {
    return this.auditLog.get(transactionId) ?? null
  }

  private recordAudit(transaction: MemoryTransaction, validationResult: TransactionValidationResult): void {
    this.auditLog.set(transaction.id, buildTransactionAudit(transaction, validationResult, this.dependencies.clock.now()))
  }
}

// `repository` has no sensible standalone default, for the same
// reason as `createBatchMemoryOperationExecutor` — a coordinator
// disconnected from the caller's actual repository would be useless.
export function createTransactionCoordinator(
  repository: MemoryRepository,
  overrides: Partial<TransactionCoordinatorDependencies> = {},
): TransactionCoordinator {
  return new DefaultTransactionCoordinator({ ...createDefaultDependencies(repository), ...overrides })
}
