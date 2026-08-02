import { describe, expect, it } from 'vitest'
import { createEventDispatcher } from './DefaultEventDispatcher'
import { createEventRepository } from '../repository'
import { IllegalEventLifecycleTransitionError } from '../lifecycle'
import { makeEventMetadata, makeFixedClock, makeSequentialIdGenerator } from '../testFixtures'

describe('DefaultEventDispatcher', () => {
  it('registerEvent() creates an event already in the recorded state and persists it', async () => {
    const repository = createEventRepository()
    const dispatcher = createEventDispatcher({
      repository,
      clock: makeFixedClock('2026-01-01T00:00:00.000Z'),
      idGenerator: makeSequentialIdGenerator('event'),
    })

    const event = await dispatcher.registerEvent('memory-created', 'memory-persistence', makeEventMetadata(), { key: 'value' })

    expect(event.id).toBe('event-1')
    expect(event.state).toBe('recorded')
    expect(event.type).toBe('memory-created')
    expect(event.source).toBe('memory-persistence')
    expect(event.payload).toEqual({ key: 'value' })
    expect(await repository.retrieve(event.id)).toEqual(event)
  })

  it('registerEvent() defaults payload to an empty object', async () => {
    const dispatcher = createEventDispatcher()
    const event = await dispatcher.registerEvent('memory-created', 'memory-persistence', makeEventMetadata())
    expect(event.payload).toEqual({})
  })

  it('dispatchEvent() transitions a recorded event to published and persists it', async () => {
    const repository = createEventRepository()
    const dispatcher = createEventDispatcher({ repository })
    const recorded = await dispatcher.registerEvent('memory-created', 'memory-persistence', makeEventMetadata())

    const published = await dispatcher.dispatchEvent(recorded)
    expect(published.state).toBe('published')
    expect((await repository.retrieve(recorded.id))?.state).toBe('published')
  })

  it('dispatchEvent() rejects an event that is not in the recorded state', async () => {
    const dispatcher = createEventDispatcher()
    const recorded = await dispatcher.registerEvent('memory-created', 'memory-persistence', makeEventMetadata())
    const published = await dispatcher.dispatchEvent(recorded)

    await expect(dispatcher.dispatchEvent(published)).rejects.toThrow(IllegalEventLifecycleTransitionError)
  })

  it('archiveEvent() transitions a recorded event to archived via the repository', async () => {
    const repository = createEventRepository()
    const dispatcher = createEventDispatcher({ repository })
    const recorded = await dispatcher.registerEvent('memory-created', 'memory-persistence', makeEventMetadata())

    const archived = await dispatcher.archiveEvent(recorded)
    expect(archived.state).toBe('archived')
    expect((await repository.retrieve(recorded.id))?.state).toBe('archived')
  })

  it('archiveEvent() rejects an already-archived event', async () => {
    const dispatcher = createEventDispatcher()
    const recorded = await dispatcher.registerEvent('memory-created', 'memory-persistence', makeEventMetadata())
    const archived = await dispatcher.archiveEvent(recorded)

    await expect(dispatcher.archiveEvent(archived)).rejects.toThrow(IllegalEventLifecycleTransitionError)
  })

  it('replayEvent() deterministically produces a fresh created-state event with the same content', async () => {
    const dispatcher = createEventDispatcher({
      clock: makeFixedClock('2026-02-01T00:00:00.000Z'),
      idGenerator: makeSequentialIdGenerator('replay'),
    })
    const original = await dispatcher.registerEvent('memory-created', 'memory-persistence', makeEventMetadata(), { key: 'value' })

    const replayed = dispatcher.replayEvent(original)
    expect(replayed.id).not.toBe(original.id)
    expect(replayed.state).toBe('created')
    expect(replayed.type).toBe(original.type)
    expect(replayed.source).toBe(original.source)
    expect(replayed.metadata).toEqual(original.metadata)
    expect(replayed.payload).toEqual(original.payload)
    expect(replayed.createdAt).toBe('2026-02-01T00:00:00.000Z')
  })

  it('replayEvent() is pure — it does not persist anything', async () => {
    const repository = createEventRepository()
    const dispatcher = createEventDispatcher({ repository })
    const original = await dispatcher.registerEvent('memory-created', 'memory-persistence', makeEventMetadata())

    const replayed = dispatcher.replayEvent(original)
    expect(await repository.retrieve(replayed.id)).toBeNull()
  })
})
