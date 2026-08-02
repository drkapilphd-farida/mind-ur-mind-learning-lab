import { describe, expect, it } from 'vitest'
import { createMemoryRetrievalService } from './DefaultMemoryRetrievalService'
import { createMemoryRepository } from '../repository'
import { makeMemory } from '../testFixtures'
import type { MemoryRepository } from '../contracts'
import type { Memory } from '../domain'

async function seed(repository: MemoryRepository, ...memories: readonly Memory[]): Promise<void> {
  for (const memory of memories) await repository.save(memory)
}

describe('DefaultMemoryRetrievalService', () => {
  it('getRecentMemories() returns active memories, most recent first, limited', async () => {
    const repository = createMemoryRepository()
    await seed(
      repository,
      makeMemory({ id: 'a', createdAt: '2026-01-01T00:00:00.000Z' }),
      makeMemory({ id: 'b', createdAt: '2026-01-03T00:00:00.000Z' }),
      makeMemory({ id: 'c', createdAt: '2026-01-02T00:00:00.000Z' }),
    )
    const service = createMemoryRetrievalService(repository)
    const result = await service.getRecentMemories('learner-1', 2)
    expect(result.map((memory) => memory.id)).toEqual(['b', 'c'])
  })

  it('getRecentMemories() excludes archived/deleted memories', async () => {
    const repository = createMemoryRepository()
    await seed(repository, makeMemory({ id: 'active', lifecycle: 'active' }), makeMemory({ id: 'archived', lifecycle: 'archived' }))
    const service = createMemoryRetrievalService(repository)
    const result = await service.getRecentMemories('learner-1', 10)
    expect(result.map((memory) => memory.id)).toEqual(['active'])
  })

  it('getRelevantMemories() filters by type and ranks by importance', async () => {
    const repository = createMemoryRepository()
    await seed(
      repository,
      makeMemory({ id: 'a', type: 'exercise', importance: 'low' }),
      makeMemory({ id: 'b', type: 'milestone', importance: 'critical' }),
      makeMemory({ id: 'c', type: 'exercise', importance: 'critical' }),
    )
    const service = createMemoryRetrievalService(repository)
    const result = await service.getRelevantMemories('learner-1', 'exercise', 10)
    expect(result.map((memory) => memory.id)).toEqual(['c', 'a'])
  })

  it('getRelevantMemories() breaks an importance tie by most recent first', async () => {
    const repository = createMemoryRepository()
    await seed(
      repository,
      makeMemory({ id: 'older', type: 'exercise', importance: 'medium', createdAt: '2026-01-01T00:00:00.000Z' }),
      makeMemory({ id: 'newer', type: 'exercise', importance: 'medium', createdAt: '2026-01-02T00:00:00.000Z' }),
    )
    const service = createMemoryRetrievalService(repository)
    const result = await service.getRelevantMemories('learner-1', 'exercise', 10)
    expect(result.map((memory) => memory.id)).toEqual(['newer', 'older'])
  })

  it('getPinnedMemories() returns only pinned, active memories', async () => {
    const repository = createMemoryRepository()
    await seed(
      repository,
      makeMemory({ id: 'pinned', pinned: true }),
      makeMemory({ id: 'unpinned', pinned: false }),
      makeMemory({ id: 'pinned-archived', pinned: true, lifecycle: 'archived' }),
    )
    const service = createMemoryRetrievalService(repository)
    const result = await service.getPinnedMemories('learner-1')
    expect(result.map((memory) => memory.id)).toEqual(['pinned'])
  })

  it('getConversationMemories() delegates to getRelevantMemories with type "conversation"', async () => {
    const repository = createMemoryRepository()
    await seed(repository, makeMemory({ id: 'a', type: 'conversation' }), makeMemory({ id: 'b', type: 'exercise' }))
    const service = createMemoryRetrievalService(repository)
    const result = await service.getConversationMemories('learner-1', 10)
    expect(result.map((memory) => memory.id)).toEqual(['a'])
  })
})
