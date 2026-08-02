import { describe, expect, it } from 'vitest'
import { createTransactionalMemoryRepository } from './DefaultTransactionalMemoryRepository'
import { createIndexedMemoryRepository } from '../indexedRepository'
import { createTypeSpecification } from '../specification'
import { makeMemory, makeTransactionMetadata } from '../testFixtures'

describe('DefaultTransactionalMemoryRepository — public behavior parity', () => {
  it('save() then load() returns the same memory as a plain IndexedMemoryRepository would', async () => {
    const repository = createTransactionalMemoryRepository()
    const memory = makeMemory()
    await repository.save(memory)
    expect(await repository.load(memory.id)).toEqual(memory)
  })

  it('update()/delete()/list()/query() behave identically to the wrapped IndexedMemoryRepository', async () => {
    const repository = createTransactionalMemoryRepository()
    await repository.save(makeMemory({ id: 'a', type: 'exercise', metadata: { learnerId: 'learner-1', source: 's', tags: [] } }))
    await repository.update(makeMemory({ id: 'a', type: 'exercise', pinned: true, metadata: { learnerId: 'learner-1', source: 's', tags: [] } }))

    expect((await repository.load('a'))?.pinned).toBe(true)
    expect((await repository.list('learner-1')).map((m) => m.id)).toEqual(['a'])
    expect((await repository.query(createTypeSpecification('exercise'), 'learner-1')).map((m) => m.id)).toEqual(['a'])

    await repository.delete('a')
    expect(await repository.load('a')).toBeNull()
  })

  it('save() maintains built-in indexes exactly like a plain IndexedMemoryRepository', async () => {
    const repository = createTransactionalMemoryRepository()
    await repository.save(makeMemory({ id: 'a', type: 'exercise' }))
    expect(repository.getIndex('type')?.entries).toEqual([{ key: 'exercise', memoryIds: ['a'] }])
  })

  it('getStatistics()/listIndexes()/validateAllIndexes()/rebuildAllIndexes() all delegate to the wrapped repository', async () => {
    const repository = createTransactionalMemoryRepository()
    const memory = makeMemory({ id: 'a', type: 'exercise' })
    await repository.save(memory)

    expect(repository.listIndexes().length).toBeGreaterThan(0)
    expect(repository.getStatistics('type', [memory])?.entryCount).toBe(1)
    expect([...repository.validateAllIndexes([memory]).values()].every((r) => r.valid)).toBe(true)

    repository.rebuildAllIndexes([memory])
    expect(repository.getIndex('type')?.entries).toEqual([{ key: 'exercise', memoryIds: ['a'] }])
  })
})

describe('DefaultTransactionalMemoryRepository — transactional surface', () => {
  it('commits a transaction and the change is visible through the plain CRUD surface', async () => {
    const repository = createTransactionalMemoryRepository()
    const transaction = repository.beginTransaction([{ type: 'create', memory: makeMemory({ id: 'a' }) }], makeTransactionMetadata())

    const committed = await repository.commitTransaction(transaction)
    expect(committed.state).toBe('committed')
    expect(await repository.load('a')).not.toBeNull()
  })

  it('a committed transaction also updates the underlying indexes', async () => {
    const repository = createTransactionalMemoryRepository()
    const transaction = repository.beginTransaction(
      [{ type: 'create', memory: makeMemory({ id: 'a', type: 'milestone' }) }],
      makeTransactionMetadata(),
    )
    await repository.commitTransaction(transaction)
    expect(repository.getIndex('type')?.entries).toEqual([{ key: 'milestone', memoryIds: ['a'] }])
  })

  it('a failed transaction leaves the repository and its indexes untouched', async () => {
    const repository = createTransactionalMemoryRepository()
    const transaction = repository.beginTransaction([{ type: 'delete', memoryId: 'ghost' }], makeTransactionMetadata())

    const failed = await repository.commitTransaction(transaction)
    expect(failed.state).toBe('failed')
    expect(repository.getIndex('memoryId')?.entries).toEqual([])
  })

  it('validateTransaction()/rollbackTransaction()/cancelTransaction()/getAudit() delegate to the coordinator', async () => {
    const repository = createTransactionalMemoryRepository()
    const transaction = repository.beginTransaction([], makeTransactionMetadata())

    expect((await repository.validateTransaction(transaction)).valid).toBe(true)

    const cancelled = repository.cancelTransaction(transaction)
    expect(cancelled.state).toBe('rolledBack')

    const failedTransaction = repository.beginTransaction([{ type: 'delete', memoryId: 'ghost' }], makeTransactionMetadata())
    const failed = await repository.commitTransaction(failedTransaction)
    expect(repository.rollbackTransaction(failed).state).toBe('rolledBack')
    expect(repository.getAudit(failed.id)?.finalState).toBe('failed')
  })

  it('constructing with an injected IndexedMemoryRepository wires the coordinator against that same instance', async () => {
    const indexed = createIndexedMemoryRepository()
    const repository = createTransactionalMemoryRepository(indexed)
    const transaction = repository.beginTransaction([{ type: 'create', memory: makeMemory({ id: 'a' }) }], makeTransactionMetadata())

    await repository.commitTransaction(transaction)
    expect(await indexed.load('a')).not.toBeNull()
  })
})
