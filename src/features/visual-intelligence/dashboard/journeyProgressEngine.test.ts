import { describe, expect, it } from 'vitest'
import { buildDnaContext, type DnaRawSources } from '../dna/dnaContext'
import { computeJourneyProgress } from './journeyProgressEngine'

const EMPTY: DnaRawSources = { imagePersistence: [], visualPreparation: [], fixation: [], persistenceChallenge: [] }

describe('computeJourneyProgress', () => {
  it('always marks Foundation/Breathing/Journey not-tracked and Dashboard active', () => {
    const stages = computeJourneyProgress(buildDnaContext(EMPTY), false)
    expect(stages.find((s) => s.id === 'foundation')!.status).toBe('not-tracked')
    expect(stages.find((s) => s.id === 'breathing')!.status).toBe('not-tracked')
    expect(stages.find((s) => s.id === 'journey')!.status).toBe('not-tracked')
    expect(stages.find((s) => s.id === 'dashboard')!.status).toBe('active')
  })

  it('marks Visual DNA completed only when a real Mind Passport snapshot exists', () => {
    const withSnapshot = computeJourneyProgress(buildDnaContext(EMPTY), true)
    expect(withSnapshot.find((s) => s.id === 'visual-dna')!.status).toBe('completed')

    const without = computeJourneyProgress(buildDnaContext(EMPTY), false)
    expect(without.find((s) => s.id === 'visual-dna')!.status).toBe('available')
  })
})
