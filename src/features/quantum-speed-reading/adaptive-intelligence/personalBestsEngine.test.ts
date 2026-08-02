import { describe, it, expect } from 'vitest'
import { computePersonalBests } from './personalBestsEngine'
import { buildSession } from './testFixtures'

describe('computePersonalBests', () => {
  it('returns all-null bests with 0 streak for no sessions', () => {
    const bests = computePersonalBests([])
    expect(bests.highestWpm).toBeNull()
    expect(bests.bestReadingDay).toBeNull()
    expect(bests.longestStreak).toBe(0)
  })

  it('computes real max/min values across sessions', () => {
    const sessions = [
      buildSession({ wpm: 200, readingIntelligenceScore: 70, accuracyPercent: 80, comprehensionPercent: 80, readingTimeMs: 60_000 }),
      buildSession({ wpm: 300, readingIntelligenceScore: 90, accuracyPercent: 95, comprehensionPercent: 95, readingTimeMs: 30_000 }),
    ]
    const bests = computePersonalBests(sessions)
    expect(bests.highestWpm).toBe(300)
    expect(bests.highestReadingScore).toBe(90)
    expect(bests.bestAccuracy).toBe(95)
    expect(bests.bestComprehension).toBe(95)
    expect(bests.fastestSessionMs).toBe(30_000)
  })

  it('ignores incomplete sessions', () => {
    const sessions = [buildSession({ completed: false, wpm: 999 }), buildSession({ completed: true, wpm: 200 })]
    const bests = computePersonalBests(sessions)
    expect(bests.highestWpm).toBe(200)
  })

  it('finds the day with the most sessions completed', () => {
    const sessions = [
      buildSession({ occurredAt: '2026-07-01T10:00:00.000Z' }),
      buildSession({ occurredAt: '2026-07-01T14:00:00.000Z' }),
      buildSession({ occurredAt: '2026-07-02T10:00:00.000Z' }),
    ]
    const bests = computePersonalBests(sessions)
    expect(bests.bestReadingDay?.dateKey).toBe('2026-07-01')
    expect(bests.bestReadingDay?.sessionCount).toBe(2)
  })
})
