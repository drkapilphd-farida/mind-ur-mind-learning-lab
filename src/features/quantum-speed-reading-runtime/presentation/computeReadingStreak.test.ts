import { describe, expect, it } from 'vitest'
import { computeReadingStreak } from './computeReadingStreak'

const NOW = new Date('2026-07-21T12:00:00.000Z')

describe('computeReadingStreak', () => {
  it('returns 0 honestly when there are no real timestamps', () => {
    expect(computeReadingStreak([], NOW)).toBe(0)
  })

  it('returns 0 when the most recent real timestamp is not today', () => {
    expect(computeReadingStreak(['2026-07-19T10:00:00.000Z'], NOW)).toBe(0)
  })

  it('counts a single day with a real timestamp today', () => {
    expect(computeReadingStreak(['2026-07-21T09:00:00.000Z'], NOW)).toBe(1)
  })

  it('counts real consecutive calendar days across documents, ignoring duplicates within a day', () => {
    const timestamps = ['2026-07-21T09:00:00.000Z', '2026-07-21T18:00:00.000Z', '2026-07-20T08:00:00.000Z', '2026-07-19T08:00:00.000Z']
    expect(computeReadingStreak(timestamps, NOW)).toBe(3)
  })

  it('stops counting at the first real gap', () => {
    const timestamps = ['2026-07-21T09:00:00.000Z', '2026-07-20T08:00:00.000Z', '2026-07-18T08:00:00.000Z']
    expect(computeReadingStreak(timestamps, NOW)).toBe(2)
  })
})
