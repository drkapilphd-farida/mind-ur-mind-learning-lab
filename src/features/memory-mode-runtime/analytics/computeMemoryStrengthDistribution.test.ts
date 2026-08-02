import { describe, expect, it } from 'vitest'
import { makeMemorySnapshot } from './testFixtures'
import { computeMemorySessionAnalytics } from './computeMemorySessionAnalytics'
import { computeMemoryStrengthDistribution } from './computeMemoryStrengthDistribution'

describe('computeMemoryStrengthDistribution', () => {
  it('reports a real, honest all-zero distribution for zero sessions', () => {
    expect(computeMemoryStrengthDistribution([])).toEqual({ strong: 0, developing: 0, needsReview: 0 })
  })

  it('counts real sessions into their real strength bands', async () => {
    const strong = computeMemorySessionAnalytics(await makeMemorySnapshot({ completionPercentage: 1, metrics: { totalChunks: 5, completedChunks: 5, skippedChunks: 0, revisitedChunks: 0, totalRepeats: 0, pauseCount: 0, checkpointCount: 0 } }))
    const needsReview = computeMemorySessionAnalytics(await makeMemorySnapshot({ completionPercentage: 0, metrics: { totalChunks: 5, completedChunks: 0, skippedChunks: 0, revisitedChunks: 5, totalRepeats: 5, pauseCount: 0, checkpointCount: 0 } }))

    expect(computeMemoryStrengthDistribution([strong, needsReview])).toEqual({ strong: 1, developing: 0, needsReview: 1 })
  })
})
