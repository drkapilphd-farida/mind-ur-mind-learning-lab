import { describe, expect, it } from 'vitest'
import { buildSessionRecommendations } from './buildSessionRecommendations'

describe('buildSessionRecommendations', () => {
  it('returns no recommendations for zero total learning time', () => {
    expect(buildSessionRecommendations(0)).toEqual([])
  })

  it('recommends exactly one session when total time fits within the typical session length', () => {
    const result = buildSessionRecommendations(600)
    expect(result).toEqual([{ sessionType: 'reading', recommendedCount: 1, averageDurationSeconds: 600 }])
  })

  it('recommends multiple sessions when total time exceeds the typical session length', () => {
    const result = buildSessionRecommendations(3600)
    expect(result[0]?.sessionType).toBe('reading')
    expect(result[0]?.recommendedCount).toBeGreaterThan(1)
  })

  it('splits total time evenly across the recommended sessions', () => {
    const result = buildSessionRecommendations(3600)
    const recommendation = result[0]!
    expect(recommendation.recommendedCount * recommendation.averageDurationSeconds).toBeCloseTo(3600, -1)
  })

  it('only ever produces a reading recommendation, never memory/revision/practice/research', () => {
    const result = buildSessionRecommendations(5000)
    expect(result).toHaveLength(1)
    expect(result[0]?.sessionType).toBe('reading')
  })
})
