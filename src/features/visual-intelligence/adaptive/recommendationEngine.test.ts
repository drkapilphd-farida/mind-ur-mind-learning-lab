import { describe, expect, it } from 'vitest'
import { recommendGoal, recommendTiming, selectChallenge } from './recommendationEngine'
import type { UnifiedVisualStats } from './types/adaptiveTypes'

function stats(overrides: Partial<UnifiedVisualStats>): UnifiedVisualStats {
  return {
    completedSessionCount: 0,
    imagePersistenceCompletedCount: 0,
    fixationCompletedCount: 0,
    persistenceChallengeCompletedCount: 0,
    visualPreparationCompletedCount: 0,
    currentStreak: 0,
    bestStreak: 0,
    totalDurationSeconds: 0,
    avgSessionTimeSeconds: 0,
    successRate: null,
    observationJournalUsageRate: null,
    restartCount: 0,
    skippedSessions: 0,
    totalXp: 0,
    ...overrides,
  }
}

describe('recommendTiming', () => {
  it('recommends 30s for a Beginner with no history', () => {
    expect(recommendTiming(stats({}))).toBe(30)
  })

  it('recommends 90s for a Master-level learner with no accuracy concerns', () => {
    expect(recommendTiming(stats({ completedSessionCount: 30, currentStreak: 14 }))).toBe(90)
  })

  it('steps down one tier when successRate is below 50', () => {
    expect(recommendTiming(stats({ completedSessionCount: 30, currentStreak: 14, successRate: 40 }))).toBe(75)
  })

  it('never steps down below 30s', () => {
    expect(recommendTiming(stats({ successRate: 10 }))).toBe(30)
  })
})

describe('selectChallenge', () => {
  it('suggests easier when successRate is below 50', () => {
    expect(selectChallenge(stats({ successRate: 30 }))).toBe('suggest-easier')
  })

  it('suggests harder for a consistent, experienced learner', () => {
    expect(selectChallenge(stats({ currentStreak: 7, completedSessionCount: 15 }))).toBe('suggest-harder')
  })

  it('moves to next when actively on a streak without a harder-suggestion trigger', () => {
    expect(selectChallenge(stats({ currentStreak: 2, completedSessionCount: 3 }))).toBe('move-to-next')
  })

  it('repeats previous with no streak at all', () => {
    expect(selectChallenge(stats({ currentStreak: 0 }))).toBe('repeat-previous')
  })
})

describe('recommendGoal', () => {
  it('recommends Improve Focus when successRate is below 60', () => {
    expect(recommendGoal(stats({ successRate: 50 }))).toBe('Improve Focus')
  })

  it('recommends Increase Observation Quality once duration and streak are both strong', () => {
    expect(recommendGoal(stats({ avgSessionTimeSeconds: 80, currentStreak: 10 }))).toBe('Increase Observation Quality')
  })

  it('defaults to Increase Duration otherwise', () => {
    expect(recommendGoal(stats({}))).toBe('Increase Duration')
  })
})
