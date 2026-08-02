import { describe, expect, it } from 'vitest'
import { makeDailyStreak, makeJourneyProgress } from '../testFixtures'
import { buildReadingJourneyState } from './buildReadingJourneyState'

describe('buildReadingJourneyState', () => {
  it('Journey State: composes journey, streak, and Mind Score without recomputing any of them', () => {
    const journey = makeJourneyProgress()
    const streak = makeDailyStreak()

    const state = buildReadingJourneyState(journey, streak, 420, 'Strong Progress')

    expect(state).toEqual({ journey, streak, mindScore: 420, mindScoreLabel: 'Strong Progress' })
  })

  it('Determinism: identical inputs produce identical output', () => {
    const journey = makeJourneyProgress()
    const streak = makeDailyStreak()

    const first = buildReadingJourneyState(journey, streak, 100, 'Growing Consistently')
    const second = buildReadingJourneyState(journey, streak, 100, 'Growing Consistently')

    expect(first).toEqual(second)
  })
})
