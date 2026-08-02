import { describe, expect, it } from 'vitest'
import { makeSmartNotesSnapshot } from './testFixtures'
import { computeSmartNotesSessionAnalytics } from './computeSmartNotesSessionAnalytics'
import { compareSmartNotesSessions } from './compareSmartNotesSessions'

describe('compareSmartNotesSessions', () => {
  it('reports a real, positive delta when the current session measured higher than the previous one', async () => {
    const previous = computeSmartNotesSessionAnalytics(await makeSmartNotesSnapshot({ completionPercentage: 0.3, metrics: { totalChunks: 10, completedChunks: 3, skippedChunks: 0, revisitedChunks: 5, totalRepeats: 5, pauseCount: 0, checkpointCount: 0 } }))
    const current = computeSmartNotesSessionAnalytics(await makeSmartNotesSnapshot({ completionPercentage: 1, metrics: { totalChunks: 10, completedChunks: 10, skippedChunks: 0, revisitedChunks: 0, totalRepeats: 0, pauseCount: 0, checkpointCount: 0 } }))

    const comparison = compareSmartNotesSessions(current, previous)

    expect(comparison.currentSessionId).toBe(current.sessionId)
    expect(comparison.previousSessionId).toBe(previous.sessionId)
    expect(comparison.engagementScoreDelta).toBeGreaterThan(0)
    expect(comparison.completionRateDelta).toBeCloseTo(0.7, 10)
    expect(comparison.revisitRateDelta).toBeLessThan(0)
  })
})
