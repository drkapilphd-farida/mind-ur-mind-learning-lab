import { describe, expect, it, vi } from 'vitest'
import { createMemoryService } from './DefaultMemoryService'
import { createMemoryRepository, MemoryNotFoundError } from '../repository'
import { createMemoryCache } from '../cache'
import { makeFixedClock, makeSequentialIdGenerator } from '../testFixtures'
import type { MemoryRepository, StoreMemoryInput } from '../contracts'

const BASE_INPUT: StoreMemoryInput = {
  learnerId: 'learner-1',
  type: 'exercise',
  importance: 'medium',
  content: 'Completed the reading warm-up.',
  source: 'exercise-engine',
}

describe('DefaultMemoryService (end-to-end, real default dependencies)', () => {
  it('storeMemory() creates an active memory with a generated id and timestamps', async () => {
    const service = createMemoryService({ idGenerator: makeSequentialIdGenerator('mem'), clock: makeFixedClock() })
    const memory = await service.storeMemory(BASE_INPUT)

    expect(memory.id).toBe('mem-1')
    expect(memory.lifecycle).toBe('active')
    expect(memory.createdAt).toBe('2026-01-01T00:00:00.000Z')
    expect(memory.pinned).toBe(false)
    expect(memory.metadata).toEqual({ learnerId: 'learner-1', source: 'exercise-engine', tags: [] })
  })

  it('storeMemory() honors explicit pinned/tags overrides', async () => {
    const service = createMemoryService()
    const memory = await service.storeMemory({ ...BASE_INPUT, pinned: true, tags: ['reading'] })
    expect(memory.pinned).toBe(true)
    expect(memory.metadata.tags).toEqual(['reading'])
  })

  it('retrieveMemory() returns the stored memory', async () => {
    const service = createMemoryService()
    const stored = await service.storeMemory(BASE_INPUT)
    expect(await service.retrieveMemory(stored.id)).toEqual(stored)
  })

  it('retrieveMemory() returns null for an unknown id', async () => {
    const service = createMemoryService()
    expect(await service.retrieveMemory('does-not-exist')).toBeNull()
  })

  it('retrieveMemory() falls back to the repository on a cache miss, then populates the cache', async () => {
    const repository = createMemoryRepository()
    const cache = createMemoryCache()
    const stored = await createMemoryService({ repository, cache }).storeMemory(BASE_INPUT)

    // A fresh cache (simulating a cold cache, e.g. after a restart) —
    // the repository still has the record, so retrieveMemory must find
    // it there and re-populate the cache.
    const freshCache = createMemoryCache()
    const service = createMemoryService({ repository, cache: freshCache })

    expect(freshCache.get(stored.id)).toBeNull()
    const retrieved = await service.retrieveMemory(stored.id)
    expect(retrieved).toEqual(stored)
    expect(freshCache.get(stored.id)).toEqual(stored)
  })

  it('retrieveMemory() serves from cache, never reaching a repository that would throw', async () => {
    const throwingRepository: MemoryRepository = {
      save: async () => {},
      load: async () => {
        throw new Error('repository.load should not be called — the cache should have served this')
      },
      update: async () => {},
      delete: async () => {},
      list: async () => [],
    }

    // storeMemory() populates the cache directly (see DefaultMemoryService.storeMemory),
    // so a subsequent retrieveMemory() on the same service instance
    // must resolve from the cache alone — proven by using a repository
    // whose load() always throws.
    const service = createMemoryService({ repository: throwingRepository })
    const stored = await service.storeMemory(BASE_INPUT)

    await expect(service.retrieveMemory(stored.id)).resolves.toEqual(stored)
  })

  it('archiveMemory() transitions lifecycle to archived and persists it', async () => {
    const service = createMemoryService()
    const stored = await service.storeMemory(BASE_INPUT)
    const archived = await service.archiveMemory(stored.id)

    expect(archived.lifecycle).toBe('archived')
    expect(await service.retrieveMemory(stored.id)).toMatchObject({ lifecycle: 'archived' })
  })

  it('archiveMemory() throws MemoryNotFoundError for an unknown id', async () => {
    const service = createMemoryService()
    await expect(service.archiveMemory('does-not-exist')).rejects.toThrow(MemoryNotFoundError)
  })

  it('deleteMemory() removes the memory from both repository and cache', async () => {
    const service = createMemoryService()
    const stored = await service.storeMemory(BASE_INPUT)
    await service.deleteMemory(stored.id)
    expect(await service.retrieveMemory(stored.id)).toBeNull()
  })

  it('deleteMemory() throws MemoryNotFoundError for an unknown id', async () => {
    const service = createMemoryService()
    await expect(service.deleteMemory('does-not-exist')).rejects.toThrow(MemoryNotFoundError)
  })

  it('is fully dependency-injected — an overridden repository is actually used', async () => {
    const saveSpy = vi.fn(async () => {})
    const stubRepository: MemoryRepository = {
      save: saveSpy,
      load: async () => null,
      update: async () => {},
      delete: async () => {},
      list: async () => [],
    }

    const service = createMemoryService({ repository: stubRepository })
    await service.storeMemory(BASE_INPUT)

    expect(saveSpy).toHaveBeenCalledTimes(1)
  })
})
