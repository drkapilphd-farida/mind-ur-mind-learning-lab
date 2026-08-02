import { describe, expect, it } from 'vitest'
import { createMemoryQueryExecutionService } from './DefaultMemoryQueryExecutionService'
import type { MemoryQueryExecutionService } from './MemoryQueryExecutionService'
import { createQueryableMemoryRepository } from '../queryableRepository'
import { createMemoryRepository } from '../repository'
import { InvalidMemoryQueryError } from '../query'
import { makeMemory, makeMemoryQuery } from '../testFixtures'

async function seededService(memories: ReturnType<typeof makeMemory>[]): Promise<MemoryQueryExecutionService> {
  const repository = createQueryableMemoryRepository(createMemoryRepository())
  for (const memory of memories) {
    await repository.save(memory)
  }
  return createMemoryQueryExecutionService(repository)
}

describe('DefaultMemoryQueryExecutionService', () => {
  it('validates the query and rejects an invalid one before touching the repository', async () => {
    const service = await seededService([])
    await expect(service.execute(makeMemoryQuery({ userId: '' }))).rejects.toThrow(InvalidMemoryQueryError)
  })

  it('returns only the requesting user\'s matching memories', async () => {
    const service = await seededService([
      makeMemory({ id: 'a', metadata: { learnerId: 'learner-1', source: 's', tags: [] } }),
      makeMemory({ id: 'b', metadata: { learnerId: 'learner-2', source: 's', tags: [] } }),
    ])
    const result = await service.execute(makeMemoryQuery())
    expect(result.items.map((m) => m.id)).toEqual(['a'])
  })

  it('applies filters via the specification layer', async () => {
    const service = await seededService([
      makeMemory({ id: 'a', type: 'exercise' }),
      makeMemory({ id: 'b', type: 'milestone' }),
    ])
    const result = await service.execute(makeMemoryQuery({ type: 'exercise' }))
    expect(result.items.map((m) => m.id)).toEqual(['a'])
  })

  it('applies sorting before pagination', async () => {
    const service = await seededService([
      makeMemory({ id: 'a', createdAt: '2026-01-01T00:00:00.000Z' }),
      makeMemory({ id: 'b', createdAt: '2026-01-03T00:00:00.000Z' }),
      makeMemory({ id: 'c', createdAt: '2026-01-02T00:00:00.000Z' }),
    ])
    const result = await service.execute(makeMemoryQuery({ sortField: 'createdAt', sortDirection: 'ascending' }))
    expect(result.items.map((m) => m.id)).toEqual(['a', 'c', 'b'])
  })

  it('applies pagination after sorting and reports totalCount vs returnedCount correctly', async () => {
    const service = await seededService([
      makeMemory({ id: 'a', createdAt: '2026-01-01T00:00:00.000Z' }),
      makeMemory({ id: 'b', createdAt: '2026-01-02T00:00:00.000Z' }),
      makeMemory({ id: 'c', createdAt: '2026-01-03T00:00:00.000Z' }),
    ])
    const result = await service.execute(makeMemoryQuery({ sortField: 'createdAt', sortDirection: 'ascending', limit: 1, offset: 1 }))
    expect(result.items.map((m) => m.id)).toEqual(['b'])
    expect(result.totalCount).toBe(3)
    expect(result.returnedCount).toBe(1)
  })

  it('echoes the original query back as appliedFilters', async () => {
    const service = await seededService([])
    const query = makeMemoryQuery({ type: 'exercise', importance: 'high' })
    const result = await service.execute(query)
    expect(result.appliedFilters).toEqual(query)
  })

  it('reports sortMetadata matching the query\'s sort field and direction', async () => {
    const service = await seededService([])
    const result = await service.execute(makeMemoryQuery({ sortField: 'importance', sortDirection: 'ascending' }))
    expect(result.sortMetadata).toEqual({ field: 'importance', direction: 'ascending' })
  })

  it('returns an immutable, empty result for a query matching nothing', async () => {
    const service = await seededService([makeMemory({ type: 'exercise' })])
    const result = await service.execute(makeMemoryQuery({ type: 'milestone' }))
    expect(result.items).toEqual([])
    expect(result.totalCount).toBe(0)
    expect(result.returnedCount).toBe(0)
  })
})
