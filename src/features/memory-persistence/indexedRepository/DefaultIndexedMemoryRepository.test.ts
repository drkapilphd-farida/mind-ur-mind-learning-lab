import { describe, expect, it } from 'vitest'
import { createIndexedMemoryRepository } from './DefaultIndexedMemoryRepository'
import { createQueryableMemoryRepository } from '../queryableRepository'
import { createMemoryRepository } from '../repository'
import { createTypeSpecification } from '../specification'
import { BUILTIN_INDEX_TYPES } from '../builtinIndexes'
import { makeFixedClock, makeMemory } from '../testFixtures'

describe('DefaultIndexedMemoryRepository — public behavior parity', () => {
  it('save() then load() returns the same memory as a plain repository would', async () => {
    const repository = createIndexedMemoryRepository()
    const memory = makeMemory()
    await repository.save(memory)
    expect(await repository.load(memory.id)).toEqual(memory)
  })

  it('update() modifies an existing memory identically to a plain repository', async () => {
    const repository = createIndexedMemoryRepository()
    await repository.save(makeMemory({ pinned: false }))
    await repository.update(makeMemory({ pinned: true }))
    expect((await repository.load('memory-1'))?.pinned).toBe(true)
  })

  it('delete() removes the memory identically to a plain repository', async () => {
    const repository = createIndexedMemoryRepository()
    await repository.save(makeMemory())
    await repository.delete('memory-1')
    expect(await repository.load('memory-1')).toBeNull()
  })

  it('list() returns the same results as the wrapped repository', async () => {
    const repository = createIndexedMemoryRepository()
    await repository.save(makeMemory({ id: 'a', metadata: { learnerId: 'learner-1', source: 's', tags: [] } }))
    await repository.save(makeMemory({ id: 'b', metadata: { learnerId: 'learner-2', source: 's', tags: [] } }))
    expect((await repository.list('learner-1')).map((m) => m.id)).toEqual(['a'])
  })

  it('query() delegates to the wrapped QueryableMemoryRepository unchanged', async () => {
    const repository = createIndexedMemoryRepository()
    await repository.save(makeMemory({ id: 'a', type: 'exercise' }))
    await repository.save(makeMemory({ id: 'b', type: 'milestone', metadata: { learnerId: 'learner-1', source: 's', tags: [] } }))
    const results = await repository.query(createTypeSpecification('exercise'), 'learner-1')
    expect(results.map((m) => m.id)).toEqual(['a'])
  })

  it('produces byte-identical results to a bare QueryableMemoryRepository given the same operations', async () => {
    const plain = createQueryableMemoryRepository(createMemoryRepository())
    const indexed = createIndexedMemoryRepository()

    const memories = [makeMemory({ id: 'a', type: 'exercise' }), makeMemory({ id: 'b', type: 'milestone' })]
    for (const memory of memories) {
      await plain.save(memory)
      await indexed.save(memory)
    }

    expect(await indexed.list('learner-1')).toEqual(await plain.list('learner-1'))
    expect(await indexed.load('a')).toEqual(await plain.load('a'))
  })
})

describe('DefaultIndexedMemoryRepository — index maintenance', () => {
  it('registers all 9 built-in indexes, empty, at construction', () => {
    const repository = createIndexedMemoryRepository()
    for (const indexType of BUILTIN_INDEX_TYPES) {
      expect(repository.getIndex(indexType)?.entries).toEqual([])
    }
    expect(repository.listIndexes()).toHaveLength(BUILTIN_INDEX_TYPES.length)
  })

  it('save() updates every built-in index for the new memory', async () => {
    const repository = createIndexedMemoryRepository()
    await repository.save(makeMemory({ id: 'a', type: 'exercise', importance: 'high' }))

    expect(repository.getIndex('type')?.entries).toEqual([{ key: 'exercise', memoryIds: ['a'] }])
    expect(repository.getIndex('importance')?.entries).toEqual([{ key: 'high', memoryIds: ['a'] }])
    expect(repository.getIndex('memoryId')?.entries).toEqual([{ key: 'a', memoryIds: ['a'] }])
  })

  it('update() re-indexes a memory whose indexed field changed', async () => {
    const repository = createIndexedMemoryRepository()
    await repository.save(makeMemory({ id: 'a', type: 'exercise' }))
    await repository.update(makeMemory({ id: 'a', type: 'milestone' }))

    expect(repository.getIndex('type')?.entries).toEqual([{ key: 'milestone', memoryIds: ['a'] }])
  })

  it('delete() removes the memory from every built-in index', async () => {
    const repository = createIndexedMemoryRepository()
    await repository.save(makeMemory({ id: 'a', type: 'exercise' }))
    await repository.delete('a')

    expect(repository.getIndex('type')?.entries).toEqual([])
  })

  it('rebuildAllIndexes() recomputes every index from the given authoritative memories', async () => {
    const clock = makeFixedClock('2026-07-01T00:00:00.000Z')
    const repository = createIndexedMemoryRepository({ clock })
    await repository.save(makeMemory({ id: 'a', type: 'exercise' }))
    await repository.delete('a')

    const memories = [makeMemory({ id: 'b', type: 'milestone' })]
    repository.rebuildAllIndexes(memories)

    expect(repository.getIndex('type')?.entries).toEqual([{ key: 'milestone', memoryIds: ['b'] }])
  })

  it('validateAllIndexes() returns a valid result for every built-in index when consistent', async () => {
    const repository = createIndexedMemoryRepository()
    const memory = makeMemory({ id: 'a', type: 'exercise' })
    await repository.save(memory)

    const results = repository.validateAllIndexes([memory])
    expect(results.size).toBe(BUILTIN_INDEX_TYPES.length)
    for (const result of results.values()) {
      expect(result.valid).toBe(true)
    }
  })

  it('validateAllIndexes() flags inconsistency when the authoritative memories no longer match', async () => {
    const repository = createIndexedMemoryRepository()
    await repository.save(makeMemory({ id: 'a', type: 'exercise' }))

    const results = repository.validateAllIndexes([])
    expect(results.get('type')?.valid).toBe(false)
  })

  it('getStatistics() reports entry/size counts and null lastRebuildAt before any rebuild', async () => {
    const repository = createIndexedMemoryRepository()
    const memory = makeMemory({ id: 'a', type: 'exercise' })
    await repository.save(memory)

    const stats = repository.getStatistics('type', [memory])
    expect(stats).toEqual({ indexType: 'type', entryCount: 1, indexSize: 1, lastRebuildAt: null, healthStatus: 'healthy' })
  })

  it('getStatistics() reports lastRebuildAt after rebuildAllIndexes() runs', async () => {
    const clock = makeFixedClock('2026-07-02T00:00:00.000Z')
    const repository = createIndexedMemoryRepository({ clock })
    const memory = makeMemory({ id: 'a', type: 'exercise' })
    await repository.save(memory)
    repository.rebuildAllIndexes([memory])

    expect(repository.getStatistics('type', [memory])?.lastRebuildAt).toBe('2026-07-02T00:00:00.000Z')
  })

  it('getStatistics() returns null for an index type that was never registered', () => {
    const repository = createIndexedMemoryRepository()
    // @ts-expect-error deliberately probing an unregistered/unknown index type
    expect(repository.getStatistics('does-not-exist', [])).toBeNull()
  })
})
