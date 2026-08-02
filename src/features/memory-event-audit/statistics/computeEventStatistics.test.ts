import { describe, expect, it } from 'vitest'
import { computeEventStatistics } from './computeEventStatistics'
import { makeMemoryEvent } from '../testFixtures'

describe('computeEventStatistics', () => {
  it('reports zeros and a null timestamp for an empty list', () => {
    const stats = computeEventStatistics([])
    expect(stats.totalEvents).toBe(0)
    expect(stats.lastEventTimestamp).toBeNull()
    expect(stats.eventsByType['memory-created']).toBe(0)
    expect(stats.eventsByState.created).toBe(0)
    expect(stats.auditHealthStatus).toBe('healthy')
  })

  it('counts totalEvents and groups by type', () => {
    const events = [
      makeMemoryEvent({ id: 'a', type: 'memory-created' }),
      makeMemoryEvent({ id: 'b', type: 'memory-created' }),
      makeMemoryEvent({ id: 'c', type: 'memory-deleted' }),
    ]
    const stats = computeEventStatistics(events)
    expect(stats.totalEvents).toBe(3)
    expect(stats.eventsByType['memory-created']).toBe(2)
    expect(stats.eventsByType['memory-deleted']).toBe(1)
    expect(stats.eventsByType['transaction-committed']).toBe(0)
  })

  it('groups by lifecycle state', () => {
    const events = [
      makeMemoryEvent({ id: 'a', state: 'recorded' }),
      makeMemoryEvent({ id: 'b', state: 'published' }),
      makeMemoryEvent({ id: 'c', state: 'published' }),
    ]
    const stats = computeEventStatistics(events)
    expect(stats.eventsByState.recorded).toBe(1)
    expect(stats.eventsByState.published).toBe(2)
    expect(stats.eventsByState.archived).toBe(0)
  })

  it('reports the latest createdAt as lastEventTimestamp regardless of array order', () => {
    const events = [
      makeMemoryEvent({ id: 'a', createdAt: '2026-01-01T00:00:00.000Z' }),
      makeMemoryEvent({ id: 'b', createdAt: '2026-01-05T00:00:00.000Z' }),
      makeMemoryEvent({ id: 'c', createdAt: '2026-01-03T00:00:00.000Z' }),
    ]
    expect(computeEventStatistics(events).lastEventTimestamp).toBe('2026-01-05T00:00:00.000Z')
  })

  it('reports auditHealthStatus healthy for a consistent event list', () => {
    const events = [makeMemoryEvent({ id: 'a' }), makeMemoryEvent({ id: 'b' })]
    expect(computeEventStatistics(events).auditHealthStatus).toBe('healthy')
  })

  it('reports auditHealthStatus invalid for an inconsistent event list', () => {
    const events = [makeMemoryEvent({ id: 'a' }), makeMemoryEvent({ id: 'a' })]
    expect(computeEventStatistics(events).auditHealthStatus).toBe('invalid')
  })
})
