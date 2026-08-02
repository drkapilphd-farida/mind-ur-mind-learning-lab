import { describe, expect, it } from 'vitest'
import { createBatchMemoryOperationExecutor } from './DefaultBatchMemoryOperationExecutor'
import { createMemoryRepository } from '../repository'
import { MemoryNotFoundError } from '../repository'
import { makeFixedClock, makeMemory } from '../testFixtures'

describe('DefaultBatchMemoryOperationExecutor', () => {
  it('applies a create operation via repository.save()', async () => {
    const repository = createMemoryRepository()
    const executor = createBatchMemoryOperationExecutor(repository)
    const memory = makeMemory({ id: 'a' })

    await executor.apply({ type: 'create', memory })
    expect(await repository.load('a')).toEqual(memory)
  })

  it('applies an update operation via repository.update()', async () => {
    const repository = createMemoryRepository()
    const executor = createBatchMemoryOperationExecutor(repository)
    await repository.save(makeMemory({ id: 'a', pinned: false }))

    await executor.apply({ type: 'update', memory: makeMemory({ id: 'a', pinned: true }) })
    expect((await repository.load('a'))?.pinned).toBe(true)
  })

  it('applies a delete operation via repository.delete()', async () => {
    const repository = createMemoryRepository()
    const executor = createBatchMemoryOperationExecutor(repository)
    await repository.save(makeMemory({ id: 'a' }))

    await executor.apply({ type: 'delete', memoryId: 'a' })
    expect(await repository.load('a')).toBeNull()
  })

  it('applies an archive operation by transitioning lifecycle and persisting via update()', async () => {
    const repository = createMemoryRepository()
    const executor = createBatchMemoryOperationExecutor(repository, makeFixedClock('2026-03-01T00:00:00.000Z'))
    await repository.save(makeMemory({ id: 'a', lifecycle: 'active' }))

    await executor.apply({ type: 'archive', memoryId: 'a' })
    const archived = await repository.load('a')
    expect(archived?.lifecycle).toBe('archived')
    expect(archived?.updatedAt).toBe('2026-03-01T00:00:00.000Z')
  })

  it('archive throws MemoryNotFoundError for a nonexistent memory', async () => {
    const repository = createMemoryRepository()
    const executor = createBatchMemoryOperationExecutor(repository)
    await expect(executor.apply({ type: 'archive', memoryId: 'ghost' })).rejects.toThrow(MemoryNotFoundError)
  })
})
