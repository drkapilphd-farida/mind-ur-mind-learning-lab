import { describe, expect, it } from 'vitest'
import { moveEventToArchived, moveEventToPublished, moveEventToRecorded, transitionEventLifecycle } from './transitionEventLifecycle'
import { IllegalEventLifecycleTransitionError } from './IllegalEventLifecycleTransitionError'
import { makeMemoryEvent } from '../testFixtures'

describe('transitionEventLifecycle', () => {
  it('walks the full happy path: created -> recorded -> published -> archived', () => {
    const created = makeMemoryEvent({ state: 'created' })
    const recorded = moveEventToRecorded(created, '2026-01-02T00:00:00.000Z')
    expect(recorded.state).toBe('recorded')
    expect(recorded.updatedAt).toBe('2026-01-02T00:00:00.000Z')

    const published = moveEventToPublished(recorded, '2026-01-03T00:00:00.000Z')
    expect(published.state).toBe('published')

    const archived = moveEventToArchived(published, '2026-01-04T00:00:00.000Z')
    expect(archived.state).toBe('archived')
  })

  it('allows recorded -> archived directly (never published)', () => {
    const recorded = makeMemoryEvent({ state: 'recorded' })
    expect(moveEventToArchived(recorded, '2026-01-02T00:00:00.000Z').state).toBe('archived')
  })

  it('rejects created -> published (must go through recorded first)', () => {
    const created = makeMemoryEvent({ state: 'created' })
    expect(() => transitionEventLifecycle(created, 'published', '2026-01-02T00:00:00.000Z')).toThrow(
      IllegalEventLifecycleTransitionError,
    )
  })

  it('rejects created -> archived (must go through recorded first)', () => {
    const created = makeMemoryEvent({ state: 'created' })
    expect(() => transitionEventLifecycle(created, 'archived', '2026-01-02T00:00:00.000Z')).toThrow(
      IllegalEventLifecycleTransitionError,
    )
  })

  it('rejects any transition out of archived (terminal)', () => {
    const archived = makeMemoryEvent({ state: 'archived' })
    expect(() => moveEventToRecorded(archived, '2026-01-02T00:00:00.000Z')).toThrow(IllegalEventLifecycleTransitionError)
  })

  it('never mutates the given event — returns a new object', () => {
    const created = makeMemoryEvent({ state: 'created' })
    const recorded = moveEventToRecorded(created, '2026-01-02T00:00:00.000Z')
    expect(created.state).toBe('created')
    expect(recorded).not.toBe(created)
  })

  it('the error message names both the from and to states', () => {
    const archived = makeMemoryEvent({ state: 'archived' })
    try {
      moveEventToPublished(archived, '2026-01-02T00:00:00.000Z')
      throw new Error('expected transition to throw')
    } catch (error) {
      expect(error).toBeInstanceOf(IllegalEventLifecycleTransitionError)
      expect((error as Error).message).toContain('"archived" -> "published"')
      expect((error as Error).name).toBe('IllegalEventLifecycleTransitionError')
    }
  })
})
