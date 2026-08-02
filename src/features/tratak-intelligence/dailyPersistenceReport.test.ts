import { describe, expect, it } from 'vitest'
import { computeDailyPersistenceReport, type DailyImageSessionSummary } from './dailyPersistenceReport'
import type { VisualIntelligenceReport } from './actions/completeTratakMissionSession'

function report(value: number): VisualIntelligenceReport {
  return {
    observationAccuracy: value,
    fixationStability: value,
    afterImageAwareness: value,
    attentionScore: value,
    visualRecall: value,
    recommendation: 'unused per-image recommendation',
  }
}

function session(value: number, xpEarned = 50): DailyImageSessionSummary {
  return { report: report(value), xpEarned }
}

describe('computeDailyPersistenceReport', () => {
  it('returns null for an empty day (never fabricates a report with no real data)', () => {
    expect(computeDailyPersistenceReport([])).toBeNull()
  })

  it('averages each named score across all sessions', () => {
    const result = computeDailyPersistenceReport([session(100), session(50), session(0)])
    expect(result?.observationAccuracy).toBe(50)
    expect(result?.fixationStability).toBe(50)
    expect(result?.visualRecall).toBe(50)
  })

  it('computes the overall persistence score as the average of all 5 real sub-scores across all images', () => {
    // All 5 sub-scores are identical per session in this fixture, so the
    // overall score should equal the same average as any single tile.
    const result = computeDailyPersistenceReport([session(80), session(60)])
    expect(result?.todaysPersistenceScore).toBe(70)
  })

  it('sums the real per-image xpEarned values, never a flat guess', () => {
    const result = computeDailyPersistenceReport([session(90, 50), session(90, 50), session(90, 40)])
    expect(result?.xpEarnedToday).toBe(140)
  })

  it('produces a real, non-empty recommendation string', () => {
    const result = computeDailyPersistenceReport([session(95), session(95)])
    expect(result?.recommendation.length).toBeGreaterThan(0)
    expect(result?.recommendation).toContain('Excellent')
  })

  it('reflects genuinely poor sessions with a lower-confidence recommendation, never inflated', () => {
    const result = computeDailyPersistenceReport([session(10), session(15)])
    expect(result?.recommendation).toContain('inconsistent')
  })
})
