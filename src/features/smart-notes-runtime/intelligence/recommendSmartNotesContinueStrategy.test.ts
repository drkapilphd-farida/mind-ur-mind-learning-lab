import { describe, expect, it } from 'vitest'
import type { SmartNotesSessionTracking } from './types/SmartNotesSessionTracking'
import { makeSmartNotesSnapshot } from './testFixtures'
import { recommendSmartNotesContinueStrategy } from './recommendSmartNotesContinueStrategy'

const FIXED_NOW = (): Date => new Date('2026-01-10T00:00:00.000Z')

function tracking(overrides: Partial<{ completionRate: number; revisitRate: number; repeatRate: number }> = {}): SmartNotesSessionTracking {
  return { sessionId: 's', completionRate: 1, revisitRate: 0, repeatRate: 0, pauseCount: 0, elapsedSeconds: 0, ...overrides }
}

describe('recommendSmartNotesContinueStrategy', () => {
  it('recommends a real resume for a recent, high-engagement session', async () => {
    const snapshot = await makeSmartNotesSnapshot({ capturedAt: '2026-01-09T23:00:00.000Z' })
    expect(recommendSmartNotesContinueStrategy(snapshot, tracking(), FIXED_NOW).action).toBe('resume')
  })

  it('recommends a quick refresh once real elapsed time crosses the disclosed threshold', async () => {
    const snapshot = await makeSmartNotesSnapshot({ capturedAt: '2026-01-01T00:00:00.000Z' })
    expect(recommendSmartNotesContinueStrategy(snapshot, tracking(), FIXED_NOW).action).toBe('quick-refresh')
  })

  it('recommends a quick refresh for a recent but low-engagement session', async () => {
    const snapshot = await makeSmartNotesSnapshot({ capturedAt: '2026-01-09T23:00:00.000Z' })
    const lowEngagementTracking = tracking({ completionRate: 0, revisitRate: 1, repeatRate: 1 })
    expect(recommendSmartNotesContinueStrategy(snapshot, lowEngagementTracking, FIXED_NOW).action).toBe('quick-refresh')
  })
})
