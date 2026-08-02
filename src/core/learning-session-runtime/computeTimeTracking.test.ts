import { describe, expect, it } from 'vitest'
import type { RuntimeEvent } from '@/core/adaptive-learning-runtime'
import { computeTimeTracking } from './computeTimeTracking'

describe('computeTimeTracking', () => {
  it('pairs a real chunk-started with its chunk-completed and computes real activeSeconds', () => {
    const eventLog: RuntimeEvent[] = [
      { id: 'e1', type: 'chunk-started', occurredAt: '2026-01-01T00:00:00.000Z', chunkNodeId: 'chunk-1' },
      { id: 'e2', type: 'chunk-completed', occurredAt: '2026-01-01T00:00:10.000Z', chunkNodeId: 'chunk-1' },
    ]
    const summary = computeTimeTracking(eventLog)

    expect(summary.chunkTimes).toEqual([{ chunkNodeId: 'chunk-1', startedAt: '2026-01-01T00:00:00.000Z', endedAt: '2026-01-01T00:00:10.000Z', activeSeconds: 10 }])
    expect(summary.totalActiveSeconds).toBe(10)
    expect(summary.sessionStartedAt).toBe('2026-01-01T00:00:00.000Z')
  })

  it('leaves a still-open chunk honestly unresolved, never estimated', () => {
    const eventLog: RuntimeEvent[] = [{ id: 'e1', type: 'chunk-started', occurredAt: '2026-01-01T00:00:00.000Z', chunkNodeId: 'chunk-1' }]
    const summary = computeTimeTracking(eventLog)

    expect(summary.chunkTimes).toEqual([{ chunkNodeId: 'chunk-1', startedAt: '2026-01-01T00:00:00.000Z', endedAt: null, activeSeconds: null }])
    expect(summary.totalActiveSeconds).toBe(0)
  })

  it('sums only real, closed pause/resume intervals', () => {
    const eventLog: RuntimeEvent[] = [
      { id: 'e1', type: 'runtime-paused', occurredAt: '2026-01-01T00:00:00.000Z' },
      { id: 'e2', type: 'runtime-resumed', occurredAt: '2026-01-01T00:00:05.000Z' },
      { id: 'e3', type: 'runtime-paused', occurredAt: '2026-01-01T00:00:10.000Z' },
    ]
    const summary = computeTimeTracking(eventLog)

    expect(summary.totalPausedSeconds).toBe(5)
  })

  it('reads real sessionEndedAt from a runtime-completed event', () => {
    const eventLog: RuntimeEvent[] = [{ id: 'e1', type: 'runtime-completed', occurredAt: '2026-01-01T00:01:00.000Z' }]
    const summary = computeTimeTracking(eventLog)

    expect(summary.sessionEndedAt).toBe('2026-01-01T00:01:00.000Z')
  })
})
