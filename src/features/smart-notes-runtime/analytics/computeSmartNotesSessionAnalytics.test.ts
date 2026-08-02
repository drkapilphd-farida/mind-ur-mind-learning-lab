import { describe, expect, it } from 'vitest'
import { makeSmartNotesSnapshot } from './testFixtures'
import { computeSmartNotesSessionAnalytics } from './computeSmartNotesSessionAnalytics'

describe('computeSmartNotesSessionAnalytics', () => {
  it('composes real snapshot fields with Sprint-3 tracking, engagement, and a real engagement level', async () => {
    const snapshot = await makeSmartNotesSnapshot({
      status: 'completed',
      completionPercentage: 1,
      metrics: { totalChunks: 5, completedChunks: 5, skippedChunks: 0, revisitedChunks: 0, totalRepeats: 0, pauseCount: 0, checkpointCount: 0 },
    })

    const analytics = computeSmartNotesSessionAnalytics(snapshot)

    expect(analytics.sessionId).toBe(snapshot.sessionId)
    expect(analytics.documentId).toBe(snapshot.documentId)
    expect(analytics.status).toBe('completed')
    expect(analytics.tracking.completionRate).toBe(1)
    expect(analytics.engagementScore).toBe(1)
    expect(analytics.engagementLevel).toBe('strong')
  })

  it('classifies a real, struggling session as needs-review', async () => {
    const snapshot = await makeSmartNotesSnapshot({
      completionPercentage: 0.1,
      metrics: { totalChunks: 10, completedChunks: 1, skippedChunks: 0, revisitedChunks: 9, totalRepeats: 9, pauseCount: 0, checkpointCount: 0 },
    })

    expect(computeSmartNotesSessionAnalytics(snapshot).engagementLevel).toBe('needs-review')
  })
})
