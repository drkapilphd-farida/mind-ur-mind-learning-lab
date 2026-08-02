import { describe, expect, it } from 'vitest'
import { getDailyInsight } from './index'
import { DAILY_INSIGHTS } from '@/constants/learning'

describe('getDailyInsight', () => {
  it('always returns one of the configured insights', () => {
    const insight = getDailyInsight(new Date('2026-07-14T12:00:00Z'))
    expect(DAILY_INSIGHTS).toContain(insight)
  })

  it('is deterministic for the same calendar day', () => {
    const first = getDailyInsight(new Date('2026-07-14T01:00:00Z'))
    const second = getDailyInsight(new Date('2026-07-14T23:00:00Z'))
    expect(first).toBe(second)
  })

  it('varies across different days (in general)', () => {
    const results = new Set<string>()
    for (let day = 1; day <= DAILY_INSIGHTS.length; day++) {
      results.add(getDailyInsight(new Date(Date.UTC(2026, 0, day))))
    }
    expect(results.size).toBeGreaterThan(1)
  })

  it('wraps around after DAILY_INSIGHTS.length days, staying deterministic per day-of-year', () => {
    const day0 = getDailyInsight(new Date(Date.UTC(2026, 0, 1)))
    const wrapped = getDailyInsight(new Date(Date.UTC(2026, 0, 1 + DAILY_INSIGHTS.length)))
    expect(wrapped).toBe(day0)
  })
})
