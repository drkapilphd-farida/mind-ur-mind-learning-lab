import { describe, expect, it } from 'vitest'
import { buildDnaContext, type DnaRawSources } from '../dna/dnaContext'
import { computeRecentActivity } from './recentActivityEngine'

const EMPTY: DnaRawSources = { imagePersistence: [], visualPreparation: [], fixation: [], persistenceChallenge: [] }

describe('computeRecentActivity', () => {
  it('returns nothing with no history and no growth signal', () => {
    expect(computeRecentActivity(buildDnaContext(EMPTY))).toHaveLength(0)
  })

  it('sorts real sessions most-recent-first with their real disclosed XP', () => {
    const raw: DnaRawSources = {
      ...EMPTY,
      fixation: [
        { exerciseType: 'static-dot', level: '30', durationSeconds: 30, accuracyPercent: null, completed: true, occurredAt: '2026-07-01T10:00:00.000Z' },
        { exerciseType: 'peripheral', level: 'standard', durationSeconds: 45, accuracyPercent: 80, completed: true, occurredAt: '2026-07-05T10:00:00.000Z' },
      ],
    }
    const activity = computeRecentActivity(buildDnaContext(raw))
    const sessions = activity.filter((a) => a.kind === 'session')
    expect(sessions[0]!.occurredAt).toBe('2026-07-05T10:00:00.000Z')
    expect(sessions[0]!.detail).toBe('+20 XP')
  })

  it('never fabricates an insight without a real weeklyImprovementPercent', () => {
    const activity = computeRecentActivity(buildDnaContext(EMPTY))
    expect(activity.some((a) => a.kind === 'insight')).toBe(false)
  })
})
