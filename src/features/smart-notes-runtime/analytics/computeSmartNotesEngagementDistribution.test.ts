import { describe, expect, it } from 'vitest'
import { makeSmartNotesSnapshot } from './testFixtures'
import { computeSmartNotesSessionAnalytics } from './computeSmartNotesSessionAnalytics'
import { computeSmartNotesEngagementDistribution } from './computeSmartNotesEngagementDistribution'

describe('computeSmartNotesEngagementDistribution', () => {
  it('reports a real, honest all-zero distribution for zero sessions', () => {
    expect(computeSmartNotesEngagementDistribution([])).toEqual({ strong: 0, developing: 0, needsReview: 0 })
  })

  it('counts real sessions into their real engagement bands', async () => {
    const strong = computeSmartNotesSessionAnalytics(await makeSmartNotesSnapshot({ completionPercentage: 1, metrics: { totalChunks: 5, completedChunks: 5, skippedChunks: 0, revisitedChunks: 0, totalRepeats: 0, pauseCount: 0, checkpointCount: 0 } }))
    const needsReview = computeSmartNotesSessionAnalytics(await makeSmartNotesSnapshot({ completionPercentage: 0, metrics: { totalChunks: 5, completedChunks: 0, skippedChunks: 0, revisitedChunks: 5, totalRepeats: 5, pauseCount: 0, checkpointCount: 0 } }))

    expect(computeSmartNotesEngagementDistribution([strong, needsReview])).toEqual({ strong: 1, developing: 0, needsReview: 1 })
  })
})
