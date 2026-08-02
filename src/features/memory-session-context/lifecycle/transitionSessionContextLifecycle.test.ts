import { describe, expect, it } from 'vitest'
import {
  moveSessionToActive,
  moveSessionToClosed,
  moveSessionToSuspended,
  transitionSessionContextLifecycle,
} from './transitionSessionContextLifecycle'
import { IllegalSessionContextLifecycleTransitionError } from './IllegalSessionContextLifecycleTransitionError'
import { makeSessionContext } from '../testFixtures'

describe('transitionSessionContextLifecycle', () => {
  it('walks the full happy path: created -> active -> suspended -> active -> closed', () => {
    const created = makeSessionContext({ lifecycle: 'created' })
    const active = moveSessionToActive(created, '2026-01-02T00:00:00.000Z')
    expect(active.lifecycle).toBe('active')
    expect(active.updatedAt).toBe('2026-01-02T00:00:00.000Z')

    const suspended = moveSessionToSuspended(active, '2026-01-03T00:00:00.000Z')
    expect(suspended.lifecycle).toBe('suspended')

    const resumed = moveSessionToActive(suspended, '2026-01-04T00:00:00.000Z')
    expect(resumed.lifecycle).toBe('active')

    const closed = moveSessionToClosed(resumed, '2026-01-05T00:00:00.000Z')
    expect(closed.lifecycle).toBe('closed')
  })

  it('allows created -> closed directly', () => {
    const created = makeSessionContext({ lifecycle: 'created' })
    expect(moveSessionToClosed(created, '2026-01-02T00:00:00.000Z').lifecycle).toBe('closed')
  })

  it('allows suspended -> closed directly', () => {
    const suspended = makeSessionContext({ lifecycle: 'suspended' })
    expect(moveSessionToClosed(suspended, '2026-01-02T00:00:00.000Z').lifecycle).toBe('closed')
  })

  it('rejects created -> suspended (must go through active first)', () => {
    const created = makeSessionContext({ lifecycle: 'created' })
    expect(() => transitionSessionContextLifecycle(created, 'suspended', '2026-01-02T00:00:00.000Z')).toThrow(
      IllegalSessionContextLifecycleTransitionError,
    )
  })

  it('rejects any transition out of closed (terminal)', () => {
    const closed = makeSessionContext({ lifecycle: 'closed' })
    expect(() => moveSessionToActive(closed, '2026-01-02T00:00:00.000Z')).toThrow(IllegalSessionContextLifecycleTransitionError)
  })

  it('never mutates the given context — returns a new object', () => {
    const created = makeSessionContext({ lifecycle: 'created' })
    const active = moveSessionToActive(created, '2026-01-02T00:00:00.000Z')
    expect(created.lifecycle).toBe('created')
    expect(active).not.toBe(created)
  })

  it('the error message names both the from and to states', () => {
    const closed = makeSessionContext({ lifecycle: 'closed' })
    try {
      moveSessionToActive(closed, '2026-01-02T00:00:00.000Z')
      throw new Error('expected transition to throw')
    } catch (error) {
      expect(error).toBeInstanceOf(IllegalSessionContextLifecycleTransitionError)
      expect((error as Error).message).toContain('"closed" -> "active"')
      expect((error as Error).name).toBe('IllegalSessionContextLifecycleTransitionError')
    }
  })
})
