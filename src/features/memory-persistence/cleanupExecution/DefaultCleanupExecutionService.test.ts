import { describe, expect, it } from 'vitest'
import { createCleanupExecutionService } from './DefaultCleanupExecutionService'
import { createTransactionalMemoryRepository } from '../transactionalRepository'
import { makeCleanupPlan, makeMemory } from '../testFixtures'

describe('DefaultCleanupExecutionService', () => {
  it('archives archive-action candidates and deletes delete-action candidates in one transaction', async () => {
    const repository = createTransactionalMemoryRepository()
    await repository.save(makeMemory({ id: 'a', lifecycle: 'active' }))
    await repository.save(makeMemory({ id: 'b', lifecycle: 'active' }))

    const plan = makeCleanupPlan({
      candidates: [
        { memoryId: 'a', action: 'archive', matchedPolicyId: 'p1', reason: 'x' },
        { memoryId: 'b', action: 'delete', matchedPolicyId: 'p2', reason: 'x' },
      ],
    })

    const service = createCleanupExecutionService()
    const result = await service.execute(plan, repository, 'learner-1')

    expect(result.transaction.state).toBe('committed')
    expect((await repository.load('a'))?.lifecycle).toBe('archived')
    expect(await repository.load('b')).toBeNull()
    expect(result.skipped).toEqual([])
    expect(result.plan).toBe(plan)
  })

  it('reports skip candidates separately and excludes them from the transaction', async () => {
    const repository = createTransactionalMemoryRepository()
    await repository.save(makeMemory({ id: 'a', lifecycle: 'active' }))

    const plan = makeCleanupPlan({
      candidates: [{ memoryId: 'a', action: 'skip', matchedPolicyId: null, reason: 'No retention policy matched.' }],
    })

    const service = createCleanupExecutionService()
    const result = await service.execute(plan, repository, 'learner-1')

    expect(result.transaction.state).toBe('committed')
    expect(result.transaction.operations).toEqual([])
    expect(result.skipped).toHaveLength(1)
    expect((await repository.load('a'))?.lifecycle).toBe('active')
  })

  it('rolls back everything (all-or-nothing) when the plan references a memory that no longer exists', async () => {
    const repository = createTransactionalMemoryRepository()
    await repository.save(makeMemory({ id: 'a', lifecycle: 'active' }))

    const plan = makeCleanupPlan({
      candidates: [
        { memoryId: 'a', action: 'archive', matchedPolicyId: 'p1', reason: 'x' },
        { memoryId: 'does-not-exist', action: 'delete', matchedPolicyId: 'p2', reason: 'x' },
      ],
    })

    const service = createCleanupExecutionService()
    const result = await service.execute(plan, repository, 'learner-1')

    expect(result.transaction.state).toBe('failed')
    // "a" must remain untouched — the whole plan failed validation
    // before anything was applied.
    expect((await repository.load('a'))?.lifecycle).toBe('active')
  })

  it('uses the configured source for the transaction metadata', async () => {
    const repository = createTransactionalMemoryRepository()
    const service = createCleanupExecutionService({ source: 'custom-cleanup-source' })
    const plan = makeCleanupPlan({ candidates: [] })

    const result = await service.execute(plan, repository, 'learner-1')
    expect(result.transaction.metadata).toEqual({ userId: 'learner-1', source: 'custom-cleanup-source' })
  })
})
