import { describe, expect, it } from 'vitest'
import { computeTratakStreak } from './tratakStreak'

describe('computeTratakStreak', () => {
  it('returns all zeros when nothing has been practiced', () => {
    expect(computeTratakStreak([])).toEqual({ currentStreak: 0, bestStreak: 0, lastPracticedDateKey: null })
  })

  it('ignores incomplete sessions', () => {
    const streak = computeTratakStreak([{ occurredAt: '2026-07-01T10:00:00Z', completed: false }], '2026-07-01')
    expect(streak.currentStreak).toBe(0)
  })

  it('counts a current streak of consecutive practiced days up to the reference date', () => {
    const sessions = [
      { occurredAt: '2026-06-30T10:00:00Z', completed: true },
      { occurredAt: '2026-07-01T10:00:00Z', completed: true },
    ]
    const streak = computeTratakStreak(sessions, '2026-07-01')
    expect(streak.currentStreak).toBe(2)
    expect(streak.lastPracticedDateKey).toBe('2026-07-01')
  })

  it('resets to 0 once a full day passes with no practice at all', () => {
    const sessions = [{ occurredAt: '2026-06-25T10:00:00Z', completed: true }]
    const streak = computeTratakStreak(sessions, '2026-07-01')
    expect(streak.currentStreak).toBe(0)
    expect(streak.bestStreak).toBe(1)
  })
})
