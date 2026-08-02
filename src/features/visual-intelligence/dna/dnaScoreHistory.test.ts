import { describe, expect, it } from 'vitest'
import { computeScoreProgress, computeStreakFromSessions, computeVisualIntelligenceScoreFromRawSessions } from './dnaScoreHistory'

describe('computeStreakFromSessions', () => {
  it('returns 0 with no sessions', () => {
    expect(computeStreakFromSessions([])).toBe(0)
  })

  it('counts a consecutive-day streak up to a fixed reference date', () => {
    const streak = computeStreakFromSessions(
      [
        { occurredAt: '2026-07-04T10:00:00.000Z', completed: true },
        { occurredAt: '2026-07-05T10:00:00.000Z', completed: true },
      ],
      '2026-07-05',
    )
    expect(streak).toBe(2)
  })
})

describe('computeVisualIntelligenceScoreFromRawSessions', () => {
  it('returns 0 with no sessions anywhere', () => {
    expect(computeVisualIntelligenceScoreFromRawSessions([], [])).toBe(0)
  })

  it('includes only dimensions with real completed sessions', () => {
    const scoreFixationOnly = computeVisualIntelligenceScoreFromRawSessions(
      [{ exerciseType: 'static-dot', level: '30', durationSeconds: 30, accuracyPercent: null, completed: true, occurredAt: '2026-07-05T10:00:00.000Z' }],
      [],
    )
    expect(scoreFixationOnly).toBeGreaterThan(0)
  })
})

describe('computeScoreProgress', () => {
  it('reports null previousScore/growth with fewer than 2 completed sessions', () => {
    const progress = computeScoreProgress([], [])
    expect(progress.previousScore).toBeNull()
    expect(progress.growthPercent).toBeNull()
    expect(progress.weeklyImprovementPercent).toBeNull()
    expect(progress.monthlyImprovementPercent).toBeNull()
  })

  it('computes a real previousScore excluding only the single most recent session', () => {
    const fixation = [
      { exerciseType: 'static-dot' as const, level: '30', durationSeconds: 30, accuracyPercent: null, completed: true, occurredAt: '2026-07-01T10:00:00.000Z' },
      { exerciseType: 'static-dot' as const, level: '30', durationSeconds: 30, accuracyPercent: null, completed: true, occurredAt: '2026-07-05T10:00:00.000Z' },
    ]
    const progress = computeScoreProgress(fixation, [])
    expect(progress.previousScore).not.toBeNull()
    expect(progress.currentScore).toBeGreaterThanOrEqual(progress.previousScore ?? 0)
  })

  it('returns null weekly/monthly improvement when all activity is within the window', () => {
    const recentOnly = [
      { exerciseType: 'static-dot' as const, level: '30', durationSeconds: 30, accuracyPercent: null, completed: true, occurredAt: new Date().toISOString() },
    ]
    const progress = computeScoreProgress(recentOnly, [])
    expect(progress.weeklyImprovementPercent).toBeNull()
    expect(progress.monthlyImprovementPercent).toBeNull()
  })
})
