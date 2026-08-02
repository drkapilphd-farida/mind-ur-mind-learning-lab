import { describe, expect, it } from 'vitest'
import { createRetentionMemoryRepository } from './DefaultRetentionMemoryRepository'
import { createTransactionalMemoryRepository } from '../transactionalRepository'
import { createTypeSpecification } from '../specification'
import { makeMemory, makeRetentionMetadata } from '../testFixtures'

describe('DefaultRetentionMemoryRepository — public behavior parity', () => {
  it('save()/load()/update()/delete()/list()/query() behave identically to the wrapped TransactionalMemoryRepository', async () => {
    const repository = createRetentionMemoryRepository()
    await repository.save(makeMemory({ id: 'a', type: 'exercise', metadata: { learnerId: 'learner-1', source: 's', tags: [] } }))
    await repository.update(makeMemory({ id: 'a', type: 'exercise', pinned: true, metadata: { learnerId: 'learner-1', source: 's', tags: [] } }))

    expect((await repository.load('a'))?.pinned).toBe(true)
    expect((await repository.list('learner-1')).map((m) => m.id)).toEqual(['a'])
    expect((await repository.query(createTypeSpecification('exercise'), 'learner-1')).map((m) => m.id)).toEqual(['a'])

    await repository.delete('a')
    expect(await repository.load('a')).toBeNull()
  })

  it('indexing surface (getIndex/listIndexes/getStatistics/validateAllIndexes/rebuildAllIndexes) delegates unchanged', async () => {
    const repository = createRetentionMemoryRepository()
    const memory = makeMemory({ id: 'a', type: 'exercise' })
    await repository.save(memory)

    expect(repository.getIndex('type')?.entries).toEqual([{ key: 'exercise', memoryIds: ['a'] }])
    expect(repository.listIndexes().length).toBeGreaterThan(0)
    expect(repository.getStatistics('type', [memory])?.entryCount).toBe(1)
    expect([...repository.validateAllIndexes([memory]).values()].every((r) => r.valid)).toBe(true)
    repository.rebuildAllIndexes([memory])
    expect(repository.getIndex('type')?.entries).toEqual([{ key: 'exercise', memoryIds: ['a'] }])
  })

  it('transactional surface (begin/commit/rollback/cancel/getAudit) delegates unchanged', async () => {
    const repository = createRetentionMemoryRepository()
    const transaction = repository.beginTransaction([{ type: 'create', memory: makeMemory({ id: 'a' }) }], { userId: 'learner-1', source: 'test' })

    expect((await repository.validateTransaction(transaction)).valid).toBe(true)
    const committed = await repository.commitTransaction(transaction)
    expect(committed.state).toBe('committed')
    expect(repository.getAudit(committed.id)?.finalState).toBe('committed')

    const cancelled = repository.cancelTransaction(repository.beginTransaction([], { userId: 'learner-1', source: 'test' }))
    expect(cancelled.state).toBe('rolledBack')

    const failingTransaction = repository.beginTransaction([{ type: 'delete', memoryId: 'ghost' }], { userId: 'learner-1', source: 'test' })
    const failed = await repository.commitTransaction(failingTransaction)
    expect(repository.rollbackTransaction(failed).state).toBe('rolledBack')
  })
})

describe('DefaultRetentionMemoryRepository — retention metadata extension', () => {
  it('getRetentionMetadata() returns null when nothing has been set', async () => {
    const repository = createRetentionMemoryRepository()
    expect(await repository.getRetentionMetadata('memory-1')).toBeNull()
  })

  it('setRetentionMetadata() then getRetentionMetadata() round-trips', async () => {
    const repository = createRetentionMemoryRepository()
    const metadata = makeRetentionMetadata({ memoryId: 'a', cleanupExcluded: true })
    await repository.setRetentionMetadata(metadata)
    expect(await repository.getRetentionMetadata('a')).toEqual(metadata)
  })

  it('setRetentionMetadata() overwrites a previous entry for the same memory id', async () => {
    const repository = createRetentionMemoryRepository()
    await repository.setRetentionMetadata(makeRetentionMetadata({ memoryId: 'a', cleanupExcluded: false }))
    await repository.setRetentionMetadata(makeRetentionMetadata({ memoryId: 'a', cleanupExcluded: true }))
    expect((await repository.getRetentionMetadata('a'))?.cleanupExcluded).toBe(true)
  })

  it('constructing with an injected TransactionalMemoryRepository wires reads/writes against that same instance', async () => {
    const wrapped = createTransactionalMemoryRepository()
    const repository = createRetentionMemoryRepository(wrapped)
    await repository.save(makeMemory({ id: 'a' }))
    expect(await wrapped.load('a')).not.toBeNull()
  })
})
