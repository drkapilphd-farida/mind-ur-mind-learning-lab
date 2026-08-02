import { describe, expect, it } from 'vitest'
import { makeSmartNotesSnapshot } from './testFixtures'
import { computeSmartNotesSessionAnalytics } from './computeSmartNotesSessionAnalytics'
import { computeSmartNotesPerformanceTimeline } from './computeSmartNotesPerformanceTimeline'

describe('computeSmartNotesPerformanceTimeline', () => {
  it('orders real sessions chronologically by real capturedAt, regardless of input order', async () => {
    const later = computeSmartNotesSessionAnalytics(await makeSmartNotesSnapshot({ capturedAt: '2026-01-05T00:00:00.000Z' }))
    const earlier = computeSmartNotesSessionAnalytics(await makeSmartNotesSnapshot({ capturedAt: '2026-01-01T00:00:00.000Z' }))

    const timeline = computeSmartNotesPerformanceTimeline([later, earlier])

    expect(timeline.map((point) => point.sessionId)).toEqual([earlier.sessionId, later.sessionId])
  })

  it('carries over each real session own engagement and completion, never inventing a value', async () => {
    const snapshot = await makeSmartNotesSnapshot({ completionPercentage: 0.4, metrics: { totalChunks: 10, completedChunks: 4, skippedChunks: 0, revisitedChunks: 0, totalRepeats: 0, pauseCount: 0, checkpointCount: 0 } })
    const analytics = computeSmartNotesSessionAnalytics(snapshot)

    const [point] = computeSmartNotesPerformanceTimeline([analytics])

    expect(point?.completionRate).toBe(0.4)
    expect(point?.engagementScore).toBe(analytics.engagementScore)
  })
})
