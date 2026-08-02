import { describe, expect, it } from 'vitest'
import { makeSmartNotesSnapshot } from './testFixtures'
import { computeSmartNotesLearningProfile } from './computeSmartNotesLearningProfile'

describe('computeSmartNotesLearningProfile', () => {
  it('reports a real, honest empty profile with insufficient-data for zero sessions', () => {
    const profile = computeSmartNotesLearningProfile([], 0)
    expect(profile).toEqual({ sessionsCompleted: 0, totalConceptsReviewed: 0, averageEngagementScore: 0, trend: 'insufficient-data', documentsWithNotes: 0 })
  })

  it('carries the real, already-computed documentsWithNotes count through unchanged', async () => {
    const snapshot = await makeSmartNotesSnapshot({ status: 'completed' })
    expect(computeSmartNotesLearningProfile([snapshot], 4).documentsWithNotes).toBe(4)
  })

  it('reports insufficient-data for a single session — one point cannot show a real trend', async () => {
    const snapshot = await makeSmartNotesSnapshot({ status: 'completed', metrics: { totalChunks: 5, completedChunks: 5, skippedChunks: 0, revisitedChunks: 0, totalRepeats: 0, pauseCount: 0, checkpointCount: 0 } })
    const profile = computeSmartNotesLearningProfile([snapshot], 1)

    expect(profile.sessionsCompleted).toBe(1)
    expect(profile.totalConceptsReviewed).toBe(5)
    expect(profile.trend).toBe('insufficient-data')
  })

  it('sums real completed chunks across every session, finished or not', async () => {
    const a = await makeSmartNotesSnapshot({ status: 'completed', capturedAt: '2026-01-01T00:00:00.000Z', metrics: { totalChunks: 5, completedChunks: 5, skippedChunks: 0, revisitedChunks: 0, totalRepeats: 0, pauseCount: 0, checkpointCount: 0 } })
    const b = await makeSmartNotesSnapshot({ status: 'paused', capturedAt: '2026-01-02T00:00:00.000Z', metrics: { totalChunks: 5, completedChunks: 2, skippedChunks: 0, revisitedChunks: 0, totalRepeats: 0, pauseCount: 1, checkpointCount: 0 } })

    const profile = computeSmartNotesLearningProfile([a, b], 0)

    expect(profile.sessionsCompleted).toBe(1)
    expect(profile.totalConceptsReviewed).toBe(7)
  })

  it('reports improving when the later half of sessions has real, meaningfully higher engagement', async () => {
    const low1 = await makeSmartNotesSnapshot({ capturedAt: '2026-01-01T00:00:00.000Z', completionPercentage: 0.2, metrics: { totalChunks: 10, completedChunks: 2, skippedChunks: 0, revisitedChunks: 5, totalRepeats: 5, pauseCount: 0, checkpointCount: 0 } })
    const low2 = await makeSmartNotesSnapshot({ capturedAt: '2026-01-02T00:00:00.000Z', completionPercentage: 0.2, metrics: { totalChunks: 10, completedChunks: 2, skippedChunks: 0, revisitedChunks: 5, totalRepeats: 5, pauseCount: 0, checkpointCount: 0 } })
    const high1 = await makeSmartNotesSnapshot({ capturedAt: '2026-01-03T00:00:00.000Z', completionPercentage: 1, metrics: { totalChunks: 10, completedChunks: 10, skippedChunks: 0, revisitedChunks: 0, totalRepeats: 0, pauseCount: 0, checkpointCount: 0 } })
    const high2 = await makeSmartNotesSnapshot({ capturedAt: '2026-01-04T00:00:00.000Z', completionPercentage: 1, metrics: { totalChunks: 10, completedChunks: 10, skippedChunks: 0, revisitedChunks: 0, totalRepeats: 0, pauseCount: 0, checkpointCount: 0 } })

    const profile = computeSmartNotesLearningProfile([high2, low1, high1, low2], 0)

    expect(profile.trend).toBe('improving')
  })

  it('reports declining when the later half has real, meaningfully lower engagement', async () => {
    const high = await makeSmartNotesSnapshot({ capturedAt: '2026-01-01T00:00:00.000Z', completionPercentage: 1, metrics: { totalChunks: 10, completedChunks: 10, skippedChunks: 0, revisitedChunks: 0, totalRepeats: 0, pauseCount: 0, checkpointCount: 0 } })
    const low = await makeSmartNotesSnapshot({ capturedAt: '2026-01-02T00:00:00.000Z', completionPercentage: 0.1, metrics: { totalChunks: 10, completedChunks: 1, skippedChunks: 0, revisitedChunks: 8, totalRepeats: 8, pauseCount: 0, checkpointCount: 0 } })

    expect(computeSmartNotesLearningProfile([high, low], 0).trend).toBe('declining')
  })

  it('reports steady when engagement stays within the disclosed noise threshold', async () => {
    const a = await makeSmartNotesSnapshot({ capturedAt: '2026-01-01T00:00:00.000Z', completionPercentage: 0.5, metrics: { totalChunks: 10, completedChunks: 5, skippedChunks: 0, revisitedChunks: 0, totalRepeats: 0, pauseCount: 0, checkpointCount: 0 } })
    const b = await makeSmartNotesSnapshot({ capturedAt: '2026-01-02T00:00:00.000Z', completionPercentage: 0.51, metrics: { totalChunks: 10, completedChunks: 5, skippedChunks: 0, revisitedChunks: 0, totalRepeats: 0, pauseCount: 0, checkpointCount: 0 } })

    expect(computeSmartNotesLearningProfile([a, b], 0).trend).toBe('steady')
  })
})
