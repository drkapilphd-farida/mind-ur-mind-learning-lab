import { describe, expect, it } from 'vitest'
import { makeSmartNotesSnapshot } from './testFixtures'
import { computeSmartNotesSessionCompletionIntelligence } from './computeSmartNotesSessionCompletionIntelligence'

describe('computeSmartNotesSessionCompletionIntelligence', () => {
  it('composes real engagement, a real pace recommendation, and real insights', async () => {
    const snapshot = await makeSmartNotesSnapshot({
      status: 'completed',
      completionPercentage: 1,
      metrics: { totalChunks: 8, completedChunks: 8, skippedChunks: 0, revisitedChunks: 0, totalRepeats: 0, pauseCount: 0, checkpointCount: 0 },
    })

    const result = computeSmartNotesSessionCompletionIntelligence(snapshot, [snapshot], 1)

    expect(result.engagementScore).toBe(1)
    expect(result.paceRecommendation.level).toBe('increase-pace')
    expect(result.insights[0]).toBe('1 smart notes session completed so far.')
    expect(result.insights).toContain("You've saved notes on 1 document.")
  })

  it('reflects a real, struggling session in every part of the bundle', async () => {
    const snapshot = await makeSmartNotesSnapshot({
      status: 'completed',
      completionPercentage: 0.3,
      metrics: { totalChunks: 10, completedChunks: 3, skippedChunks: 0, revisitedChunks: 6, totalRepeats: 6, pauseCount: 2, checkpointCount: 0 },
    })

    const result = computeSmartNotesSessionCompletionIntelligence(snapshot, [snapshot], 0)

    expect(result.engagementScore).toBeLessThan(0.5)
    expect(result.paceRecommendation.level).toBe('slow-down')
  })
})
