import { describe, expect, it } from 'vitest'
import { createQueryableMemoryRepository } from './DefaultQueryableMemoryRepository'
import { createMemoryRepository } from '../repository'
import { createTypeSpecification } from '../specification'
import { makeMemory } from '../testFixtures'

describe('DefaultQueryableMemoryRepository', () => {
  it('delegates save()/load() to the wrapped repository', async () => {
    const repository = createQueryableMemoryRepository(createMemoryRepository())
    const memory = makeMemory()
    await repository.save(memory)
    expect(await repository.load(memory.id)).toEqual(memory)
  })

  it('delegates update() to the wrapped repository', async () => {
    const repository = createQueryableMemoryRepository(createMemoryRepository())
    await repository.save(makeMemory({ pinned: false }))
    await repository.update(makeMemory({ pinned: true }))
    expect((await repository.load('memory-1'))?.pinned).toBe(true)
  })

  it('delegates delete() to the wrapped repository', async () => {
    const repository = createQueryableMemoryRepository(createMemoryRepository())
    await repository.save(makeMemory())
    await repository.delete('memory-1')
    expect(await repository.load('memory-1')).toBeNull()
  })

  it('delegates list() to the wrapped repository', async () => {
    const repository = createQueryableMemoryRepository(createMemoryRepository())
    await repository.save(makeMemory({ id: 'a', metadata: { learnerId: 'learner-1', source: 's', tags: [] } }))
    await repository.save(makeMemory({ id: 'b', metadata: { learnerId: 'learner-2', source: 's', tags: [] } }))
    expect((await repository.list('learner-1')).map((m) => m.id)).toEqual(['a'])
  })

  it('query() filters the wrapped repository\'s learner-scoped list by the given specification', async () => {
    const repository = createQueryableMemoryRepository(createMemoryRepository())
    await repository.save(makeMemory({ id: 'a', type: 'exercise', metadata: { learnerId: 'learner-1', source: 's', tags: [] } }))
    await repository.save(makeMemory({ id: 'b', type: 'milestone', metadata: { learnerId: 'learner-1', source: 's', tags: [] } }))
    await repository.save(makeMemory({ id: 'c', type: 'exercise', metadata: { learnerId: 'learner-2', source: 's', tags: [] } }))

    const results = await repository.query(createTypeSpecification('exercise'), 'learner-1')
    expect(results.map((m) => m.id)).toEqual(['a'])
  })

  it('query() returns an empty list when nothing matches', async () => {
    const repository = createQueryableMemoryRepository(createMemoryRepository())
    await repository.save(makeMemory({ id: 'a', type: 'exercise' }))
    const results = await repository.query(createTypeSpecification('milestone'), 'learner-1')
    expect(results).toEqual([])
  })
})
