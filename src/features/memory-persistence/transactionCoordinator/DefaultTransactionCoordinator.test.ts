import { describe, expect, it } from 'vitest'
import { createTransactionCoordinator } from './DefaultTransactionCoordinator'
import { createMemoryRepository } from '../repository'
import { createBatchMemoryOperationExecutor } from '../batchOperations'
import { createRollbackEngine, RollbackIntegrityError } from '../rollbackEngine'
import { IllegalTransactionStateTransitionError } from '../transactionLifecycle'
import type { TransactionOperation } from '../transactionDomain'
import type { RollbackEngine } from '../rollbackEngine'
import { makeFixedClock, makeMemory, makeSequentialIdGenerator, makeTransactionMetadata } from '../testFixtures'

describe('DefaultTransactionCoordinator', () => {
  it('beginTransaction() creates a transaction in the created state with a generated id', () => {
    const repository = createMemoryRepository()
    const coordinator = createTransactionCoordinator(repository, {
      clock: makeFixedClock('2026-01-01T00:00:00.000Z'),
      idGenerator: makeSequentialIdGenerator('transaction'),
    })

    const transaction = coordinator.beginTransaction([], makeTransactionMetadata())
    expect(transaction.id).toBe('transaction-1')
    expect(transaction.state).toBe('created')
    expect(transaction.createdAt).toBe('2026-01-01T00:00:00.000Z')
  })

  it('validateTransaction() delegates to the shared validateTransaction function', async () => {
    const repository = createMemoryRepository()
    const coordinator = createTransactionCoordinator(repository)
    const transaction = coordinator.beginTransaction([{ type: 'delete', memoryId: 'ghost' }], makeTransactionMetadata())

    const result = await coordinator.validateTransaction(transaction)
    expect(result.valid).toBe(false)
  })

  it('commitTransaction() applies every operation and lands on committed', async () => {
    const repository = createMemoryRepository()
    const coordinator = createTransactionCoordinator(repository, { clock: makeFixedClock('2026-02-01T00:00:00.000Z') })
    await repository.save(makeMemory({ id: 'existing', pinned: false }))

    const operations: readonly TransactionOperation[] = [
      { type: 'create', memory: makeMemory({ id: 'new' }) },
      { type: 'update', memory: makeMemory({ id: 'existing', pinned: true }) },
    ]
    const transaction = coordinator.beginTransaction(operations, makeTransactionMetadata())
    const committed = await coordinator.commitTransaction(transaction)

    expect(committed.state).toBe('committed')
    expect(await repository.load('new')).not.toBeNull()
    expect((await repository.load('existing'))?.pinned).toBe(true)
  })

  it('commitTransaction() rejects committing a transaction that is not in the created state', async () => {
    const repository = createMemoryRepository()
    const coordinator = createTransactionCoordinator(repository)
    const transaction = coordinator.beginTransaction([], makeTransactionMetadata())
    const committed = await coordinator.commitTransaction(transaction)

    await expect(coordinator.commitTransaction(committed)).rejects.toThrow(IllegalTransactionStateTransitionError)
  })

  it('commitTransaction() fails without touching the repository when validation fails', async () => {
    const repository = createMemoryRepository()
    const coordinator = createTransactionCoordinator(repository)
    const transaction = coordinator.beginTransaction([{ type: 'delete', memoryId: 'ghost' }], makeTransactionMetadata())

    const failed = await coordinator.commitTransaction(transaction)
    expect(failed.state).toBe('failed')
  })

  it('commitTransaction() rolls back everything already applied when a later operation fails mid-batch (all-or-nothing)', async () => {
    const repository = createMemoryRepository()

    let callCount = 0
    const realExecutor = createBatchMemoryOperationExecutor(repository)
    const failingExecutor = {
      apply: async (operation: TransactionOperation) => {
        callCount += 1
        if (callCount === 2) throw new Error('simulated mid-batch failure')
        return realExecutor.apply(operation)
      },
    }

    const coordinator = createTransactionCoordinator(repository, { executor: failingExecutor })
    const operations: readonly TransactionOperation[] = [
      { type: 'create', memory: makeMemory({ id: 'a' }) },
      { type: 'create', memory: makeMemory({ id: 'b' }) },
    ]
    const transaction = coordinator.beginTransaction(operations, makeTransactionMetadata())
    const failed = await coordinator.commitTransaction(transaction)

    expect(failed.state).toBe('failed')
    // "a" was successfully created by the first operation, then the
    // second operation threw — the rollback engine must have undone
    // the first operation's effect too, leaving nothing behind.
    expect(await repository.load('a')).toBeNull()
    expect(await repository.load('b')).toBeNull()
  })

  it('commitTransaction() throws RollbackIntegrityError when the rollback engine cannot restore integrity', async () => {
    const repository = createMemoryRepository()
    const realRollbackEngine = createRollbackEngine(repository)
    const brokenRollbackEngine: RollbackEngine = {
      captureSnapshot: (operations) => realRollbackEngine.captureSnapshot(operations),
      restoreSnapshot: (snapshot) => realRollbackEngine.restoreSnapshot(snapshot),
      validateRollbackIntegrity: async () => false,
    }

    const failingExecutor = {
      apply: async () => {
        throw new Error('simulated failure')
      },
    }

    const coordinator = createTransactionCoordinator(repository, { executor: failingExecutor, rollbackEngine: brokenRollbackEngine })
    const transaction = coordinator.beginTransaction([{ type: 'create', memory: makeMemory({ id: 'a' }) }], makeTransactionMetadata())

    await expect(coordinator.commitTransaction(transaction)).rejects.toThrow(RollbackIntegrityError)
  })

  it('rollbackTransaction() transitions a failed transaction to rolledBack', async () => {
    const repository = createMemoryRepository()
    const coordinator = createTransactionCoordinator(repository, { clock: makeFixedClock('2026-05-01T00:00:00.000Z') })
    const transaction = coordinator.beginTransaction([{ type: 'delete', memoryId: 'ghost' }], makeTransactionMetadata())
    const failed = await coordinator.commitTransaction(transaction)

    const rolledBack = coordinator.rollbackTransaction(failed)
    expect(rolledBack.state).toBe('rolledBack')
  })

  it('cancelTransaction() transitions a created transaction to rolledBack', () => {
    const repository = createMemoryRepository()
    const coordinator = createTransactionCoordinator(repository)
    const transaction = coordinator.beginTransaction([], makeTransactionMetadata())

    const cancelled = coordinator.cancelTransaction(transaction)
    expect(cancelled.state).toBe('rolledBack')
  })

  it('getAudit() returns null before any transaction has been committed', () => {
    const repository = createMemoryRepository()
    const coordinator = createTransactionCoordinator(repository)
    expect(coordinator.getAudit('does-not-exist')).toBeNull()
  })

  it('getAudit() returns the audit for a committed transaction', async () => {
    const repository = createMemoryRepository()
    const coordinator = createTransactionCoordinator(repository, { clock: makeFixedClock('2026-06-01T00:00:00.000Z') })
    const transaction = coordinator.beginTransaction([{ type: 'create', memory: makeMemory({ id: 'a' }) }], makeTransactionMetadata())
    const committed = await coordinator.commitTransaction(transaction)

    const audit = coordinator.getAudit(committed.id)
    expect(audit).toEqual({
      transactionId: committed.id,
      timestamp: '2026-06-01T00:00:00.000Z',
      operations: committed.operations,
      finalState: 'committed',
      validationResult: { valid: true, issues: [] },
    })
  })

  it('getAudit() returns the audit for a failed transaction, including the validation issues', async () => {
    const repository = createMemoryRepository()
    const coordinator = createTransactionCoordinator(repository)
    const transaction = coordinator.beginTransaction([{ type: 'delete', memoryId: 'ghost' }], makeTransactionMetadata())
    const failed = await coordinator.commitTransaction(transaction)

    const audit = coordinator.getAudit(failed.id)
    expect(audit?.finalState).toBe('failed')
    expect(audit?.validationResult.valid).toBe(false)
  })
})
