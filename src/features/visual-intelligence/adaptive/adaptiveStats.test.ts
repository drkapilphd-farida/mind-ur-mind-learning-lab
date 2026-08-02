import { describe, expect, it } from 'vitest'
import { computeUnifiedVisualStats } from './adaptiveStats'

const EMPTY_SOURCES = { imagePersistence: [], visualPreparation: [], fixation: [], persistenceChallenge: [] }

describe('computeUnifiedVisualStats', () => {
  it('returns an honest zero-state with no sessions anywhere', () => {
    const stats = computeUnifiedVisualStats(EMPTY_SOURCES)
    expect(stats.completedSessionCount).toBe(0)
    expect(stats.currentStreak).toBe(0)
    expect(stats.bestStreak).toBe(0)
    expect(stats.avgSessionTimeSeconds).toBe(0)
    expect(stats.successRate).toBeNull()
    expect(stats.observationJournalUsageRate).toBeNull()
    expect(stats.restartCount).toBe(0)
    expect(stats.skippedSessions).toBe(0)
    expect(stats.totalXp).toBe(0)
  })

  it('sums completed sessions across all 4 tables', () => {
    const stats = computeUnifiedVisualStats({
      imagePersistence: [{ durationSeconds: 45, completed: true, occurredAt: '2026-07-01T10:00:00.000Z' }],
      visualPreparation: [{ durationSeconds: 216, completed: true, occurredAt: '2026-07-01T10:00:00.000Z' }],
      fixation: [{ exerciseType: 'static-dot', level: '30', durationSeconds: 30, accuracyPercent: null, completed: true, occurredAt: '2026-07-01T10:00:00.000Z' }],
      persistenceChallenge: [{ imageId: 'nature', reflectionResponse: 'dim-image', journalNotes: null, durationSeconds: 75, completed: true, occurredAt: '2026-07-01T10:00:00.000Z' }],
    })
    expect(stats.completedSessionCount).toBe(4)
    expect(stats.imagePersistenceCompletedCount).toBe(1)
    expect(stats.visualPreparationCompletedCount).toBe(1)
    expect(stats.fixationCompletedCount).toBe(1)
    expect(stats.persistenceChallengeCompletedCount).toBe(1)
  })

  it('ignores incomplete rows entirely', () => {
    const stats = computeUnifiedVisualStats({
      ...EMPTY_SOURCES,
      fixation: [{ exerciseType: 'static-dot', level: '30', durationSeconds: 30, accuracyPercent: null, completed: false, occurredAt: '2026-07-01T10:00:00.000Z' }],
    })
    expect(stats.completedSessionCount).toBe(0)
  })

  it('computes XP from disclosed constants only, excluding visual_preparation', () => {
    const stats = computeUnifiedVisualStats({
      imagePersistence: [{ durationSeconds: 45, completed: true, occurredAt: '2026-07-01T10:00:00.000Z' }],
      visualPreparation: [{ durationSeconds: 216, completed: true, occurredAt: '2026-07-01T10:00:00.000Z' }],
      fixation: [{ exerciseType: 'static-dot', level: '30', durationSeconds: 30, accuracyPercent: null, completed: true, occurredAt: '2026-07-01T10:00:00.000Z' }],
      persistenceChallenge: [{ imageId: 'nature', reflectionResponse: 'dim-image', journalNotes: null, durationSeconds: 75, completed: true, occurredAt: '2026-07-01T10:00:00.000Z' }],
    })
    // 25 (image persistence) + 20 (fixation) + 25 (persistence challenge); visual_preparation excluded
    expect(stats.totalXp).toBe(70)
  })

  it('averages successRate only over non-null accuracy_percent rows', () => {
    const stats = computeUnifiedVisualStats({
      ...EMPTY_SOURCES,
      fixation: [
        { exerciseType: 'multi-dot', level: '3', durationSeconds: 30, accuracyPercent: 80, completed: true, occurredAt: '2026-07-01T10:00:00.000Z' },
        { exerciseType: 'static-dot', level: '30', durationSeconds: 30, accuracyPercent: null, completed: true, occurredAt: '2026-07-01T10:00:00.000Z' },
        { exerciseType: 'peripheral', level: 'standard', durationSeconds: 45, accuracyPercent: 60, completed: true, occurredAt: '2026-07-01T10:00:00.000Z' },
      ],
    })
    expect(stats.successRate).toBe(70)
  })

  it('computes observationJournalUsageRate from non-empty journal notes only', () => {
    const stats = computeUnifiedVisualStats({
      ...EMPTY_SOURCES,
      persistenceChallenge: [
        { imageId: 'nature', reflectionResponse: 'dim-image', journalNotes: 'saw something', durationSeconds: 75, completed: true, occurredAt: '2026-07-01T10:00:00.000Z' },
        { imageId: 'animal', reflectionResponse: 'bright-image', journalNotes: null, durationSeconds: 75, completed: true, occurredAt: '2026-07-02T10:00:00.000Z' },
        { imageId: 'object', reflectionResponse: 'nothing-noticeable', journalNotes: '   ', durationSeconds: 75, completed: true, occurredAt: '2026-07-03T10:00:00.000Z' },
      ],
    })
    expect(stats.observationJournalUsageRate).toBeCloseTo(1 / 3, 5)
  })

  it('merges occurrence dates across all 4 tables for the unified streak', () => {
    const stats = computeUnifiedVisualStats({
      imagePersistence: [{ durationSeconds: 45, completed: true, occurredAt: '2026-07-03T10:00:00.000Z' }],
      visualPreparation: [{ durationSeconds: 216, completed: true, occurredAt: '2026-07-04T10:00:00.000Z' }],
      fixation: [{ exerciseType: 'static-dot', level: '30', durationSeconds: 30, accuracyPercent: null, completed: true, occurredAt: '2026-07-05T10:00:00.000Z' }],
      persistenceChallenge: [],
    })
    // Streak crosses 3 different tables across 3 consecutive days.
    expect(stats.bestStreak).toBe(3)
  })
})
