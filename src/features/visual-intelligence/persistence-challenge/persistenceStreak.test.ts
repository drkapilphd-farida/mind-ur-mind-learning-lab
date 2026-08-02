import { describe, expect, it } from 'vitest'
import { computePersistenceStreak } from './persistenceStreak'

describe('computePersistenceStreak', () => {
  it('returns all zeros when there are no sessions', () => {
    expect(computePersistenceStreak([])).toEqual({ currentStreak: 0, bestStreak: 0, lastPracticedDateKey: null })
  })

  it('ignores incomplete sessions entirely', () => {
    const result = computePersistenceStreak([{ occurredAt: '2026-07-05T10:00:00.000Z', completed: false }], '2026-07-05')
    expect(result).toEqual({ currentStreak: 0, bestStreak: 0, lastPracticedDateKey: null })
  })

  it('counts multiple sessions on the same day as a single streak day', () => {
    const result = computePersistenceStreak(
      [
        { occurredAt: '2026-07-05T09:00:00.000Z', completed: true },
        { occurredAt: '2026-07-05T15:00:00.000Z', completed: true },
      ],
      '2026-07-05',
    )
    expect(result.currentStreak).toBe(1)
    expect(result.bestStreak).toBe(1)
  })

  it('extends the streak across consecutive days', () => {
    const result = computePersistenceStreak(
      [
        { occurredAt: '2026-07-03T10:00:00.000Z', completed: true },
        { occurredAt: '2026-07-04T10:00:00.000Z', completed: true },
        { occurredAt: '2026-07-05T10:00:00.000Z', completed: true },
      ],
      '2026-07-05',
    )
    expect(result.currentStreak).toBe(3)
    expect(result.bestStreak).toBe(3)
    expect(result.lastPracticedDateKey).toBe('2026-07-05')
  })

  it('keeps the streak alive if the reference day has not been practiced yet but yesterday was', () => {
    const result = computePersistenceStreak([{ occurredAt: '2026-07-04T10:00:00.000Z', completed: true }], '2026-07-05')
    expect(result.currentStreak).toBe(1)
  })

  it('resets the current streak to 0 after a full missed day', () => {
    const result = computePersistenceStreak([{ occurredAt: '2026-07-01T10:00:00.000Z', completed: true }], '2026-07-05')
    expect(result.currentStreak).toBe(0)
    expect(result.bestStreak).toBe(1)
  })
})
