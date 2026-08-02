import { describe, expect, it } from 'vitest'
import { moveMemoryToActive, moveMemoryToArchived, moveMemoryToDeleted, transitionMemoryLifecycle } from './transitionMemoryLifecycle'
import { IllegalMemoryLifecycleTransitionError } from './IllegalMemoryLifecycleTransitionError'
import { makeMemory } from '../testFixtures'

describe('transitionMemoryLifecycle', () => {
  it('walks the full happy path: created -> active -> archived -> active -> deleted', () => {
    const created = makeMemory({ lifecycle: 'created' })
    const active = moveMemoryToActive(created, '2026-01-02T00:00:00.000Z')
    expect(active.lifecycle).toBe('active')
    expect(active.updatedAt).toBe('2026-01-02T00:00:00.000Z')

    const archived = moveMemoryToArchived(active, '2026-01-03T00:00:00.000Z')
    expect(archived.lifecycle).toBe('archived')

    const reactivated = moveMemoryToActive(archived, '2026-01-04T00:00:00.000Z')
    expect(reactivated.lifecycle).toBe('active')

    const deleted = moveMemoryToDeleted(reactivated, '2026-01-05T00:00:00.000Z')
    expect(deleted.lifecycle).toBe('deleted')
  })

  it('allows created -> deleted directly', () => {
    const created = makeMemory({ lifecycle: 'created' })
    expect(moveMemoryToDeleted(created, '2026-01-02T00:00:00.000Z').lifecycle).toBe('deleted')
  })

  it('rejects created -> archived (must go through active first)', () => {
    const created = makeMemory({ lifecycle: 'created' })
    expect(() => transitionMemoryLifecycle(created, 'archived', '2026-01-02T00:00:00.000Z')).toThrow(IllegalMemoryLifecycleTransitionError)
  })

  it('rejects any transition out of deleted (terminal)', () => {
    const deleted = makeMemory({ lifecycle: 'deleted' })
    expect(() => moveMemoryToActive(deleted, '2026-01-02T00:00:00.000Z')).toThrow(IllegalMemoryLifecycleTransitionError)
  })

  it('never mutates the given memory — returns a new object', () => {
    const created = makeMemory({ lifecycle: 'created' })
    const active = moveMemoryToActive(created, '2026-01-02T00:00:00.000Z')
    expect(created.lifecycle).toBe('created')
    expect(active).not.toBe(created)
  })
})
