import { describe, expect, it } from 'vitest'
import { validateEvents } from './validateEvents'
import { makeMemoryEvent } from '../testFixtures'

describe('validateEvents', () => {
  it('reports valid: true for an empty list', () => {
    expect(validateEvents([])).toEqual({ valid: true, issues: [] })
  })

  it('reports valid: true for a well-formed, chronologically ordered list', () => {
    const events = [
      makeMemoryEvent({ id: 'a', createdAt: '2026-01-01T00:00:00.000Z' }),
      makeMemoryEvent({ id: 'b', createdAt: '2026-01-02T00:00:00.000Z' }),
    ]
    expect(validateEvents(events)).toEqual({ valid: true, issues: [] })
  })

  it('detects a duplicate-event when the same id appears more than once', () => {
    const events = [makeMemoryEvent({ id: 'a' }), makeMemoryEvent({ id: 'a' })]
    const result = validateEvents(events)
    expect(result.valid).toBe(false)
    expect(result.issues.some((issue) => issue.type === 'duplicate-event')).toBe(true)
  })

  it('detects invalid-transition for an event with an unrecognized state', () => {
    const events = [makeMemoryEvent({ id: 'a', state: 'not-a-real-state' as never })]
    const result = validateEvents(events)
    expect(result.valid).toBe(false)
    expect(result.issues.some((issue) => issue.type === 'invalid-transition')).toBe(true)
  })

  it('detects missing-reference for an event with an empty subjectId', () => {
    const events = [makeMemoryEvent({ id: 'a', metadata: { subjectId: '', userId: 'learner-1', tags: [] } })]
    const result = validateEvents(events)
    expect(result.valid).toBe(false)
    expect(result.issues.some((issue) => issue.type === 'missing-reference')).toBe(true)
  })

  it('detects missing-reference for an event with a whitespace-only subjectId', () => {
    const events = [makeMemoryEvent({ id: 'a', metadata: { subjectId: '   ', userId: 'learner-1', tags: [] } })]
    const result = validateEvents(events)
    expect(result.issues.some((issue) => issue.type === 'missing-reference')).toBe(true)
  })

  it('detects an ordering-violation when a later event has an earlier createdAt', () => {
    const events = [
      makeMemoryEvent({ id: 'a', createdAt: '2026-01-05T00:00:00.000Z' }),
      makeMemoryEvent({ id: 'b', createdAt: '2026-01-01T00:00:00.000Z' }),
    ]
    const result = validateEvents(events)
    expect(result.valid).toBe(false)
    expect(result.issues.some((issue) => issue.type === 'ordering-violation')).toBe(true)
  })

  it('does not flag an ordering-violation for two events with the same createdAt', () => {
    const events = [
      makeMemoryEvent({ id: 'a', createdAt: '2026-01-01T00:00:00.000Z' }),
      makeMemoryEvent({ id: 'b', createdAt: '2026-01-01T00:00:00.000Z' }),
    ]
    const result = validateEvents(events)
    expect(result.issues.some((issue) => issue.type === 'ordering-violation')).toBe(false)
  })
})
