import { describe, expect, it } from 'vitest'
import { createMemoryRepository } from './InMemoryMemoryRepository'
import { MemoryNotFoundError } from './MemoryNotFoundError'
import { makeMemory } from '../testFixtures'

describe('InMemoryMemoryRepository', () => {
  it('save() then load() returns the same memory', async () => {
    const repository = createMemoryRepository()
    const memory = makeMemory()
    await repository.save(memory)
    expect(await repository.load(memory.id)).toEqual(memory)
  })

  it('load() returns null for an unknown id', async () => {
    const repository = createMemoryRepository()
    expect(await repository.load('does-not-exist')).toBeNull()
  })

  it('save() overwrites an existing entry with the same id', async () => {
    const repository = createMemoryRepository()
    await repository.save(makeMemory({ content: 'first' }))
    await repository.save(makeMemory({ content: 'second' }))
    expect((await repository.load('memory-1'))?.content).toBe('second')
  })

  it('update() modifies an existing memory', async () => {
    const repository = createMemoryRepository()
    await repository.save(makeMemory({ pinned: false }))
    await repository.update(makeMemory({ pinned: true }))
    expect((await repository.load('memory-1'))?.pinned).toBe(true)
  })

  it('update() throws MemoryNotFoundError for an unsaved id', async () => {
    const repository = createMemoryRepository()
    await expect(repository.update(makeMemory())).rejects.toThrow(MemoryNotFoundError)
  })

  it('delete() removes the memory', async () => {
    const repository = createMemoryRepository()
    await repository.save(makeMemory())
    await repository.delete('memory-1')
    expect(await repository.load('memory-1')).toBeNull()
  })

  it('delete() throws MemoryNotFoundError for an unsaved id', async () => {
    const repository = createMemoryRepository()
    await expect(repository.delete('does-not-exist')).rejects.toThrow(MemoryNotFoundError)
  })

  it('list() returns only the given learner’s memories', async () => {
    const repository = createMemoryRepository()
    await repository.save(makeMemory({ id: 'a', metadata: { learnerId: 'learner-1', source: 's', tags: [] } }))
    await repository.save(makeMemory({ id: 'b', metadata: { learnerId: 'learner-2', source: 's', tags: [] } }))
    const results = await repository.list('learner-1')
    expect(results.map((memory) => memory.id)).toEqual(['a'])
  })
})
