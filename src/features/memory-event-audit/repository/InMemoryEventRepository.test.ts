import { describe, expect, it } from 'vitest'
import { createEventRepository } from './InMemoryEventRepository'
import { EventNotFoundError } from './EventNotFoundError'
import { makeFixedClock, makeMemoryEvent } from '../testFixtures'

describe('InMemoryEventRepository', () => {
  it('store() then retrieve() returns the same event', async () => {
    const repository = createEventRepository()
    const event = makeMemoryEvent()
    await repository.store(event)
    expect(await repository.retrieve(event.id)).toEqual(event)
  })

  it('retrieve() returns null for an unknown id', async () => {
    const repository = createEventRepository()
    expect(await repository.retrieve('does-not-exist')).toBeNull()
  })

  it('store() overwrites an existing entry with the same id', async () => {
    const repository = createEventRepository()
    await repository.store(makeMemoryEvent({ state: 'recorded' }))
    await repository.store(makeMemoryEvent({ state: 'published' }))
    expect((await repository.retrieve('event-1'))?.state).toBe('published')
  })

  it('filter() returns only events matching the given predicate', async () => {
    const repository = createEventRepository()
    await repository.store(makeMemoryEvent({ id: 'a', type: 'memory-created' }))
    await repository.store(makeMemoryEvent({ id: 'b', type: 'memory-deleted' }))
    const results = await repository.filter((event) => event.type === 'memory-created')
    expect(results.map((e) => e.id)).toEqual(['a'])
  })

  it('archive() sets state to archived and bumps updatedAt via the injected clock', async () => {
    const repository = createEventRepository(makeFixedClock('2026-03-01T00:00:00.000Z'))
    await repository.store(makeMemoryEvent({ state: 'recorded', updatedAt: '2026-01-01T00:00:00.000Z' }))
    const archived = await repository.archive('event-1')

    expect(archived.state).toBe('archived')
    expect(archived.updatedAt).toBe('2026-03-01T00:00:00.000Z')
    expect((await repository.retrieve('event-1'))?.state).toBe('archived')
  })

  it('archive() throws EventNotFoundError for an unstored id', async () => {
    const repository = createEventRepository()
    await expect(repository.archive('does-not-exist')).rejects.toThrow(EventNotFoundError)
  })
})
