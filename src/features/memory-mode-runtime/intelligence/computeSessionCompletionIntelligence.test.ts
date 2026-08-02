import { describe, expect, it } from 'vitest'
import { makeMemorySnapshot } from './testFixtures'
import { computeSessionCompletionIntelligence } from './computeSessionCompletionIntelligence'

describe('computeSessionCompletionIntelligence', () => {
  it('composes real confidence, a real difficulty recommendation, and real insights', async () => {
    const snapshot = await makeMemorySnapshot({
      status: 'completed',
      completionPercentage: 1,
      metrics: { totalChunks: 8, completedChunks: 8, skippedChunks: 0, revisitedChunks: 0, totalRepeats: 0, pauseCount: 0, checkpointCount: 0 },
    })

    const result = computeSessionCompletionIntelligence(snapshot, [snapshot])

    expect(result.confidenceScore).toBe(1)
    expect(result.difficultyRecommendation.level).toBe('increase-pace')
    expect(result.insights[0]).toBe('1 memory session completed so far.')
  })

  it('reflects a real, struggling session in every part of the bundle', async () => {
    const snapshot = await makeMemorySnapshot({
      status: 'completed',
      completionPercentage: 0.3,
      metrics: { totalChunks: 10, completedChunks: 3, skippedChunks: 0, revisitedChunks: 6, totalRepeats: 6, pauseCount: 2, checkpointCount: 0 },
    })

    const result = computeSessionCompletionIntelligence(snapshot, [snapshot])

    expect(result.confidenceScore).toBeLessThan(0.5)
    expect(result.difficultyRecommendation.level).toBe('slow-down')
  })
})
