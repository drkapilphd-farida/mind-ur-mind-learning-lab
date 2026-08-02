import { describe, expect, it } from 'vitest'
import { makeMemorySnapshot } from './testFixtures'
import { computeMemoryLearningProfile } from './computeMemoryLearningProfile'

describe('computeMemoryLearningProfile', () => {
  it('reports a real, honest empty profile with insufficient-data for zero sessions', () => {
    const profile = computeMemoryLearningProfile([])
    expect(profile).toEqual({ sessionsCompleted: 0, totalConceptsReviewed: 0, averageConfidenceScore: 0, trend: 'insufficient-data' })
  })

  it('reports insufficient-data for a single session — one point cannot show a real trend', async () => {
    const snapshot = await makeMemorySnapshot({ status: 'completed', metrics: { totalChunks: 5, completedChunks: 5, skippedChunks: 0, revisitedChunks: 0, totalRepeats: 0, pauseCount: 0, checkpointCount: 0 } })
    const profile = computeMemoryLearningProfile([snapshot])

    expect(profile.sessionsCompleted).toBe(1)
    expect(profile.totalConceptsReviewed).toBe(5)
    expect(profile.trend).toBe('insufficient-data')
  })

  it('sums real completed chunks across every session, finished or not', async () => {
    const a = await makeMemorySnapshot({ status: 'completed', capturedAt: '2026-01-01T00:00:00.000Z', metrics: { totalChunks: 5, completedChunks: 5, skippedChunks: 0, revisitedChunks: 0, totalRepeats: 0, pauseCount: 0, checkpointCount: 0 } })
    const b = await makeMemorySnapshot({ status: 'paused', capturedAt: '2026-01-02T00:00:00.000Z', metrics: { totalChunks: 5, completedChunks: 2, skippedChunks: 0, revisitedChunks: 0, totalRepeats: 0, pauseCount: 1, checkpointCount: 0 } })

    const profile = computeMemoryLearningProfile([a, b])

    expect(profile.sessionsCompleted).toBe(1)
    expect(profile.totalConceptsReviewed).toBe(7)
  })

  it('reports improving when the later half of sessions has real, meaningfully higher confidence', async () => {
    const low1 = await makeMemorySnapshot({ capturedAt: '2026-01-01T00:00:00.000Z', completionPercentage: 0.2, metrics: { totalChunks: 10, completedChunks: 2, skippedChunks: 0, revisitedChunks: 5, totalRepeats: 5, pauseCount: 0, checkpointCount: 0 } })
    const low2 = await makeMemorySnapshot({ capturedAt: '2026-01-02T00:00:00.000Z', completionPercentage: 0.2, metrics: { totalChunks: 10, completedChunks: 2, skippedChunks: 0, revisitedChunks: 5, totalRepeats: 5, pauseCount: 0, checkpointCount: 0 } })
    const high1 = await makeMemorySnapshot({ capturedAt: '2026-01-03T00:00:00.000Z', completionPercentage: 1, metrics: { totalChunks: 10, completedChunks: 10, skippedChunks: 0, revisitedChunks: 0, totalRepeats: 0, pauseCount: 0, checkpointCount: 0 } })
    const high2 = await makeMemorySnapshot({ capturedAt: '2026-01-04T00:00:00.000Z', completionPercentage: 1, metrics: { totalChunks: 10, completedChunks: 10, skippedChunks: 0, revisitedChunks: 0, totalRepeats: 0, pauseCount: 0, checkpointCount: 0 } })

    const profile = computeMemoryLearningProfile([high2, low1, high1, low2])

    expect(profile.trend).toBe('improving')
  })

  it('reports declining when the later half has real, meaningfully lower confidence', async () => {
    const high = await makeMemorySnapshot({ capturedAt: '2026-01-01T00:00:00.000Z', completionPercentage: 1, metrics: { totalChunks: 10, completedChunks: 10, skippedChunks: 0, revisitedChunks: 0, totalRepeats: 0, pauseCount: 0, checkpointCount: 0 } })
    const low = await makeMemorySnapshot({ capturedAt: '2026-01-02T00:00:00.000Z', completionPercentage: 0.1, metrics: { totalChunks: 10, completedChunks: 1, skippedChunks: 0, revisitedChunks: 8, totalRepeats: 8, pauseCount: 0, checkpointCount: 0 } })

    expect(computeMemoryLearningProfile([high, low]).trend).toBe('declining')
  })

  it('reports steady when confidence stays within the disclosed noise threshold', async () => {
    const a = await makeMemorySnapshot({ capturedAt: '2026-01-01T00:00:00.000Z', completionPercentage: 0.5, metrics: { totalChunks: 10, completedChunks: 5, skippedChunks: 0, revisitedChunks: 0, totalRepeats: 0, pauseCount: 0, checkpointCount: 0 } })
    const b = await makeMemorySnapshot({ capturedAt: '2026-01-02T00:00:00.000Z', completionPercentage: 0.51, metrics: { totalChunks: 10, completedChunks: 5, skippedChunks: 0, revisitedChunks: 0, totalRepeats: 0, pauseCount: 0, checkpointCount: 0 } })

    expect(computeMemoryLearningProfile([a, b]).trend).toBe('steady')
  })
})
