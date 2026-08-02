import { describe, expect, it } from 'vitest'
import { buildDnaContext, type DnaRawSources } from '../dna/dnaContext'
import { computeDashboardMission } from './todaysMissionEngine'

const EMPTY: DnaRawSources = { imagePersistence: [], visualPreparation: [], fixation: [], persistenceChallenge: [] }

describe('computeDashboardMission', () => {
  it('assigns fixation XP for a fixation route and sums real benefit deltas into brain gain', () => {
    const mission = computeDashboardMission(buildDnaContext(EMPTY), [{ categoryId: 'visual-speed', label: 'Increase Visual Speed', score: 10 }])
    expect(mission.exerciseHref).toContain('/fixation/')
    expect(mission.estimatedXp).toBe(20)
    expect(mission.estimatedBrainGain).toBe(mission.estimatedBenefits.reduce((sum, b) => sum + b.delta, 0))
  })

  it('assigns persistence-challenge XP when that is the recommended mission', () => {
    const mission = computeDashboardMission(buildDnaContext(EMPTY), [])
    expect(mission.exerciseHref).toBe('/labs/visual-intelligence/persistence-challenge')
    expect(mission.estimatedXp).toBe(25)
  })
})
