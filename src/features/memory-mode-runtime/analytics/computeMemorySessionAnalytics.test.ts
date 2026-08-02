import { describe, expect, it } from 'vitest'
import { makeMemorySnapshot } from './testFixtures'
import { computeMemorySessionAnalytics } from './computeMemorySessionAnalytics'

describe('computeMemorySessionAnalytics', () => {
  it('composes real snapshot fields with Sprint-3 tracking, confidence, and a real strength level', async () => {
    const snapshot = await makeMemorySnapshot({
      status: 'completed',
      completionPercentage: 1,
      metrics: { totalChunks: 5, completedChunks: 5, skippedChunks: 0, revisitedChunks: 0, totalRepeats: 0, pauseCount: 0, checkpointCount: 0 },
    })

    const analytics = computeMemorySessionAnalytics(snapshot)

    expect(analytics.sessionId).toBe(snapshot.sessionId)
    expect(analytics.documentId).toBe(snapshot.documentId)
    expect(analytics.status).toBe('completed')
    expect(analytics.tracking.completionRate).toBe(1)
    expect(analytics.confidenceScore).toBe(1)
    expect(analytics.strengthLevel).toBe('strong')
  })

  it('classifies a real, struggling session as needs-review', async () => {
    const snapshot = await makeMemorySnapshot({
      completionPercentage: 0.1,
      metrics: { totalChunks: 10, completedChunks: 1, skippedChunks: 0, revisitedChunks: 9, totalRepeats: 9, pauseCount: 0, checkpointCount: 0 },
    })

    expect(computeMemorySessionAnalytics(snapshot).strengthLevel).toBe('needs-review')
  })
})
