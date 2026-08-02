import { describe, expect, it } from 'vitest'
import { buildDnaContext, type DnaRawSources } from '../dna/dnaContext'
import { computeTrainingCalendar } from './trainingCalendarEngine'

const EMPTY: DnaRawSources = { imagePersistence: [], visualPreparation: [], fixation: [], persistenceChallenge: [] }

describe('computeTrainingCalendar', () => {
  it('returns exactly 84 days', () => {
    expect(computeTrainingCalendar(buildDnaContext(EMPTY))).toHaveLength(84)
  })
})
