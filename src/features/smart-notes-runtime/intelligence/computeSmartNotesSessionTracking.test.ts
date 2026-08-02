import { describe, expect, it } from 'vitest'
import { makeSmartNotesSnapshot } from './testFixtures'
import { computeSmartNotesSessionTracking } from './computeSmartNotesSessionTracking'

describe('computeSmartNotesSessionTracking', () => {
  it('derives real rates from real RuntimeMetrics', async () => {
    const snapshot = await makeSmartNotesSnapshot({
      completionPercentage: 0.6,
      metrics: { totalChunks: 10, completedChunks: 6, skippedChunks: 0, revisitedChunks: 3, totalRepeats: 2, pauseCount: 1, checkpointCount: 0 },
      startedAt: '2026-01-01T00:00:00.000Z',
      completedAt: null,
      capturedAt: '2026-01-01T00:10:00.000Z',
    })

    const tracking = computeSmartNotesSessionTracking(snapshot)

    expect(tracking.completionRate).toBe(0.6)
    expect(tracking.revisitRate).toBe(0.3)
    expect(tracking.repeatRate).toBeCloseTo(2 / 6, 10)
    expect(tracking.pauseCount).toBe(1)
    expect(tracking.elapsedSeconds).toBe(600)
  })

  it('reports honest zero rates, never NaN, when there is nothing to divide by yet', async () => {
    const snapshot = await makeSmartNotesSnapshot({
      completionPercentage: 0,
      metrics: { totalChunks: 5, completedChunks: 0, skippedChunks: 0, revisitedChunks: 0, totalRepeats: 0, pauseCount: 0, checkpointCount: 0 },
    })

    const tracking = computeSmartNotesSessionTracking(snapshot)

    expect(tracking.revisitRate).toBe(0)
    expect(tracking.repeatRate).toBe(0)
    expect(Number.isNaN(tracking.repeatRate)).toBe(false)
  })

  it('uses the real completedAt, not capturedAt, once a session has completed', async () => {
    const snapshot = await makeSmartNotesSnapshot({
      startedAt: '2026-01-01T00:00:00.000Z',
      completedAt: '2026-01-01T00:05:00.000Z',
      capturedAt: '2026-01-01T00:20:00.000Z',
    })

    expect(computeSmartNotesSessionTracking(snapshot).elapsedSeconds).toBe(300)
  })

  it('reports zero elapsed time, honestly, for a session with no real startedAt yet', async () => {
    const snapshot = await makeSmartNotesSnapshot({ startedAt: null })

    expect(computeSmartNotesSessionTracking(snapshot).elapsedSeconds).toBe(0)
  })
})
