import { describe, it, expect } from 'vitest'
import { computeReadingProfile } from './readingProfileEngine'
import { buildSession } from './testFixtures'

describe('computeReadingProfile', () => {
  it('returns all-zero/null profile for no sessions', () => {
    const profile = computeReadingProfile([])
    expect(profile.sessionsCompleted).toBe(0)
    expect(profile.averageWpm).toBe(0)
    expect(profile.bestCategory).toBeNull()
    expect(profile.weakestCategory).toBeNull()
    expect(profile.lastReadingDate).toBeNull()
  })

  it('computes real averages from completed sessions', () => {
    const sessions = [
      buildSession({ wpm: 200, accuracyPercent: 80, comprehensionPercent: 80, readingIntelligenceScore: 80 }),
      buildSession({ wpm: 300, accuracyPercent: 100, comprehensionPercent: 100, readingIntelligenceScore: 100 }),
    ]
    const profile = computeReadingProfile(sessions)
    expect(profile.averageWpm).toBe(250)
    expect(profile.averageAccuracy).toBe(90)
    expect(profile.sessionsCompleted).toBe(2)
  })

  it('ignores incomplete sessions in averages and counts', () => {
    const sessions = [
      buildSession({ completed: true, wpm: 200 }),
      buildSession({ completed: false, wpm: 900 }),
    ]
    const profile = computeReadingProfile(sessions)
    expect(profile.sessionsCompleted).toBe(1)
    expect(profile.averageWpm).toBe(200)
  })

  it('identifies best and weakest category only with 2+ distinct categories', () => {
    const sessions = [
      buildSession({ category: 'science', accuracyPercent: 95 }),
      buildSession({ category: 'history', accuracyPercent: 60 }),
    ]
    const profile = computeReadingProfile(sessions)
    expect(profile.bestCategory).toBe('science')
    expect(profile.weakestCategory).toBe('history')
  })

  it('does not assign a weakest category with only one category practiced', () => {
    const sessions = [buildSession({ category: 'science', accuracyPercent: 95 })]
    const profile = computeReadingProfile(sessions)
    expect(profile.bestCategory).toBe('science')
    expect(profile.weakestCategory).toBeNull()
  })

  it('uses the most recent session for currentDifficulty', () => {
    const sessions = [
      buildSession({ difficulty: 'hard', occurredAt: '2026-07-04T10:00:00.000Z' }),
      buildSession({ difficulty: 'easy', occurredAt: '2026-07-01T10:00:00.000Z' }),
    ]
    const profile = computeReadingProfile(sessions)
    expect(profile.currentDifficulty).toBe('hard')
  })

  it('selects the most recent session by timestamp regardless of input order', () => {
    const sessions = [
      buildSession({ difficulty: 'easy', occurredAt: '2026-07-01T10:00:00.000Z' }),
      buildSession({ difficulty: 'hard', occurredAt: '2026-07-04T10:00:00.000Z' }),
    ]
    const profile = computeReadingProfile(sessions)
    expect(profile.currentDifficulty).toBe('hard')
  })

  it('sums total reading time across completed sessions only', () => {
    const sessions = [
      buildSession({ completed: true, readingTimeMs: 30_000 }),
      buildSession({ completed: true, readingTimeMs: 45_000 }),
      buildSession({ completed: false, readingTimeMs: 999_000 }),
    ]
    const profile = computeReadingProfile(sessions)
    expect(profile.totalReadingTimeMs).toBe(75_000)
  })
})
