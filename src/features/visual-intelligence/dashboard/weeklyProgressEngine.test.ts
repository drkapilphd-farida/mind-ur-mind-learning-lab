import { describe, expect, it } from 'vitest'
import { buildDnaContext, type DnaRawSources } from '../dna/dnaContext'
import { computeDailyBuckets, computeWeeklyProgress } from './weeklyProgressEngine'

const EMPTY: DnaRawSources = { imagePersistence: [], visualPreparation: [], fixation: [], persistenceChallenge: [] }

describe('computeWeeklyProgress', () => {
  it('returns exactly 7 days, all honestly empty with no history', () => {
    const days = computeWeeklyProgress(buildDnaContext(EMPTY))
    expect(days).toHaveLength(7)
    expect(days.every((d) => d.sessionsCount === 0 && d.observationScore === null && d.growthPercent === null)).toBe(true)
  })

  it('places a real completed session on its own real calendar day', () => {
    const days = computeDailyBuckets(
      buildDnaContext({
        ...EMPTY,
        fixation: [{ exerciseType: 'static-dot', level: '30', durationSeconds: 30, accuracyPercent: null, completed: true, occurredAt: '2026-07-05T10:00:00.000Z' }],
      }),
      7,
      '2026-07-05',
    )
    const today = days.find((d) => d.dateKey === '2026-07-05')!
    expect(today.sessionsCount).toBe(1)
    expect(today.xp).toBe(20)
  })

  it('computes observationScore only on days with a real persistence-challenge session', () => {
    const days = computeDailyBuckets(
      buildDnaContext({
        ...EMPTY,
        persistenceChallenge: [
          { imageId: 'nature', reflectionResponse: 'dim-image', journalNotes: 'a note', durationSeconds: 75, completed: true, occurredAt: '2026-07-05T10:00:00.000Z' },
        ],
      }),
      7,
      '2026-07-05',
    )
    expect(days.find((d) => d.dateKey === '2026-07-05')!.observationScore).toBe(100)
    expect(days.find((d) => d.dateKey === '2026-07-04')!.observationScore).toBeNull()
  })
})
