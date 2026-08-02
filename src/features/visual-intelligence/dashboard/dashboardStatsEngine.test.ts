import { describe, expect, it } from 'vitest'
import { buildDnaContext, type DnaRawSources } from '../dna/dnaContext'
import { computeDashboardStats } from './dashboardStatsEngine'

const EMPTY: DnaRawSources = { imagePersistence: [], visualPreparation: [], fixation: [], persistenceChallenge: [] }

describe('computeDashboardStats', () => {
  it('returns an honest zero-state with no history', () => {
    const stats = computeDashboardStats(buildDnaContext(EMPTY), 'Beginner')
    expect(stats.totalSessions).toBe(0)
    expect(stats.trainingMinutes).toBe(0)
    expect(stats.averageAccuracy).toBeNull()
    expect(stats.visualScore).toBe(0)
    expect(stats.mindScore).toBe(0)
    expect(stats.xp).toBe(0)
  })

  it('derives mindScore from the same single Visual Intelligence dimension as visualScore', () => {
    const raw: DnaRawSources = {
      ...EMPTY,
      fixation: [{ exerciseType: 'static-dot', level: '90', durationSeconds: 90, accuracyPercent: null, completed: true, occurredAt: '2026-07-05T10:00:00.000Z' }],
    }
    const stats = computeDashboardStats(buildDnaContext(raw), 'Beginner')
    // computeMindScore([visualScore/10]) round-trips to (approximately) visualScore for one dimension.
    expect(stats.mindScore).toBe(stats.visualScore)
  })
})
