import { describe, expect, it } from 'vitest'
import {
  moveProfileToActive,
  moveProfileToArchived,
  moveProfileToSuspended,
  transitionPersonalizationLifecycle,
} from './transitionPersonalizationLifecycle'
import { IllegalPersonalizationLifecycleTransitionError } from './IllegalPersonalizationLifecycleTransitionError'
import { makePersonalizationProfile } from '../testFixtures'

describe('transitionPersonalizationLifecycle', () => {
  it('walks the full happy path: created -> active -> suspended -> active -> archived', () => {
    const created = makePersonalizationProfile({ lifecycle: 'created' })
    const active = moveProfileToActive(created, '2026-01-02T00:00:00.000Z')
    expect(active.lifecycle).toBe('active')
    expect(active.updatedAt).toBe('2026-01-02T00:00:00.000Z')

    const suspended = moveProfileToSuspended(active, '2026-01-03T00:00:00.000Z')
    expect(suspended.lifecycle).toBe('suspended')

    const resumed = moveProfileToActive(suspended, '2026-01-04T00:00:00.000Z')
    expect(resumed.lifecycle).toBe('active')

    const archived = moveProfileToArchived(resumed, '2026-01-05T00:00:00.000Z')
    expect(archived.lifecycle).toBe('archived')
  })

  it('allows created -> archived directly', () => {
    const created = makePersonalizationProfile({ lifecycle: 'created' })
    expect(moveProfileToArchived(created, '2026-01-02T00:00:00.000Z').lifecycle).toBe('archived')
  })

  it('rejects created -> suspended (must go through active first)', () => {
    const created = makePersonalizationProfile({ lifecycle: 'created' })
    expect(() => transitionPersonalizationLifecycle(created, 'suspended', '2026-01-02T00:00:00.000Z')).toThrow(
      IllegalPersonalizationLifecycleTransitionError,
    )
  })

  it('rejects any transition out of archived (terminal)', () => {
    const archived = makePersonalizationProfile({ lifecycle: 'archived' })
    expect(() => moveProfileToActive(archived, '2026-01-02T00:00:00.000Z')).toThrow(IllegalPersonalizationLifecycleTransitionError)
  })

  it('never mutates the given profile — returns a new object', () => {
    const created = makePersonalizationProfile({ lifecycle: 'created' })
    const active = moveProfileToActive(created, '2026-01-02T00:00:00.000Z')
    expect(created.lifecycle).toBe('created')
    expect(active).not.toBe(created)
  })

  it('the error message names both the from and to states', () => {
    const archived = makePersonalizationProfile({ lifecycle: 'archived' })
    try {
      moveProfileToActive(archived, '2026-01-02T00:00:00.000Z')
      throw new Error('expected transition to throw')
    } catch (error) {
      expect(error).toBeInstanceOf(IllegalPersonalizationLifecycleTransitionError)
      expect((error as Error).message).toContain('"archived" -> "active"')
      expect((error as Error).name).toBe('IllegalPersonalizationLifecycleTransitionError')
    }
  })
})
