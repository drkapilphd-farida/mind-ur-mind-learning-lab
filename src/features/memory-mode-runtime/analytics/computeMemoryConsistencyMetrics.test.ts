import { describe, expect, it } from 'vitest'
import { makeMemorySnapshot } from './testFixtures'
import { computeMemoryConsistencyMetrics } from './computeMemoryConsistencyMetrics'

const FIXED_NOW = (): Date => new Date('2026-01-05T12:00:00.000Z')

describe('computeMemoryConsistencyMetrics', () => {
  it('reports a real, honest all-zero result for zero sessions', () => {
    expect(computeMemoryConsistencyMetrics([], FIXED_NOW)).toEqual({ activeDays: 0, currentStreakDays: 0, longestStreakDays: 0, averageSessionsPerActiveDay: 0 })
  })

  it('counts real distinct active days, collapsing multiple real sessions on the same UTC day', async () => {
    const a = await makeMemorySnapshot({ capturedAt: '2026-01-01T01:00:00.000Z' })
    const b = await makeMemorySnapshot({ capturedAt: '2026-01-01T20:00:00.000Z' })
    const c = await makeMemorySnapshot({ capturedAt: '2026-01-02T01:00:00.000Z' })

    const metrics = computeMemoryConsistencyMetrics([a, b, c], FIXED_NOW)

    expect(metrics.activeDays).toBe(2)
    expect(metrics.averageSessionsPerActiveDay).toBe(1.5)
  })

  it('finds the real longest run of consecutive calendar days', async () => {
    const day1 = await makeMemorySnapshot({ capturedAt: '2026-01-01T00:00:00.000Z' })
    const day2 = await makeMemorySnapshot({ capturedAt: '2026-01-02T00:00:00.000Z' })
    const day3 = await makeMemorySnapshot({ capturedAt: '2026-01-03T00:00:00.000Z' })
    const day10 = await makeMemorySnapshot({ capturedAt: '2026-01-10T00:00:00.000Z' })

    expect(computeMemoryConsistencyMetrics([day1, day2, day3, day10], FIXED_NOW).longestStreakDays).toBe(3)
  })

  it('reports a real current streak counting back from today, and zero if today had no real activity', async () => {
    const today = await makeMemorySnapshot({ capturedAt: '2026-01-05T08:00:00.000Z' })
    const yesterday = await makeMemorySnapshot({ capturedAt: '2026-01-04T08:00:00.000Z' })
    const dayBefore = await makeMemorySnapshot({ capturedAt: '2026-01-03T08:00:00.000Z' })

    expect(computeMemoryConsistencyMetrics([today, yesterday, dayBefore], FIXED_NOW).currentStreakDays).toBe(3)

    const onlyYesterday = await makeMemorySnapshot({ capturedAt: '2026-01-04T08:00:00.000Z' })
    expect(computeMemoryConsistencyMetrics([onlyYesterday], FIXED_NOW).currentStreakDays).toBe(0)
  })
})
