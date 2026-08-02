import { describe, expect, it } from 'vitest'
import { makeMemorySnapshot } from './testFixtures'
import { computeMemorySessionAnalytics } from './computeMemorySessionAnalytics'
import { computeMemoryPerformanceTimeline } from './computeMemoryPerformanceTimeline'

describe('computeMemoryPerformanceTimeline', () => {
  it('orders real sessions chronologically by real capturedAt, regardless of input order', async () => {
    const later = computeMemorySessionAnalytics(await makeMemorySnapshot({ capturedAt: '2026-01-05T00:00:00.000Z' }))
    const earlier = computeMemorySessionAnalytics(await makeMemorySnapshot({ capturedAt: '2026-01-01T00:00:00.000Z' }))

    const timeline = computeMemoryPerformanceTimeline([later, earlier])

    expect(timeline.map((point) => point.sessionId)).toEqual([earlier.sessionId, later.sessionId])
  })

  it('carries over each real session own confidence and completion, never inventing a value', async () => {
    const snapshot = await makeMemorySnapshot({ completionPercentage: 0.4, metrics: { totalChunks: 10, completedChunks: 4, skippedChunks: 0, revisitedChunks: 0, totalRepeats: 0, pauseCount: 0, checkpointCount: 0 } })
    const analytics = computeMemorySessionAnalytics(snapshot)

    const [point] = computeMemoryPerformanceTimeline([analytics])

    expect(point?.completionRate).toBe(0.4)
    expect(point?.confidenceScore).toBe(analytics.confidenceScore)
  })
})
