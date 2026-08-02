import { describe, expect, it } from 'vitest'
import { computeReportHistory } from './reportHistory'
import type { TratakMissionSessionRecord } from './tratakTypes'
import type { VisualIntelligenceReport } from './actions/completeTratakMissionSession'

function report(overallValue: number): VisualIntelligenceReport {
  return {
    observationAccuracy: overallValue,
    fixationStability: overallValue,
    afterImageAwareness: overallValue,
    attentionScore: overallValue,
    visualRecall: overallValue,
    recommendation: 'Test recommendation.',
  }
}

function session(overrides: Partial<TratakMissionSessionRecord> & { report?: VisualIntelligenceReport | null }): TratakMissionSessionRecord {
  const { report: reportOverride, ...rest } = overrides
  return {
    missionId: 'mandala-persistence',
    durationSeconds: 60,
    completed: true,
    occurredAt: '2026-01-01T00:00:00.000Z',
    levelNumber: 1,
    analyzerData: reportOverride === undefined ? null : { report: reportOverride },
    xpEarned: 50,
    ...rest,
  }
}

describe('computeReportHistory', () => {
  it('is entirely null when no sessions have a real report', () => {
    const history = computeReportHistory([session({ report: null }), session({ analyzerData: null })])
    expect(history).toEqual({ latestSession: null, previousSession: null, bestSession: null, improvementPercent: null })
  })

  it('never fabricates a previous session or improvement when only one report exists', () => {
    const history = computeReportHistory([session({ occurredAt: '2026-01-02T00:00:00.000Z', report: report(70) })])
    expect(history.latestSession?.report.observationAccuracy).toBe(70)
    expect(history.previousSession).toBeNull()
    expect(history.improvementPercent).toBeNull()
    expect(history.bestSession?.report.observationAccuracy).toBe(70)
  })

  it('computes a real improvement delta between the latest and previous real reports (newest first)', () => {
    const history = computeReportHistory([
      session({ occurredAt: '2026-01-02T00:00:00.000Z', report: report(80) }),
      session({ occurredAt: '2026-01-01T00:00:00.000Z', report: report(60) }),
    ])
    expect(history.latestSession?.report.observationAccuracy).toBe(80)
    expect(history.previousSession?.report.observationAccuracy).toBe(60)
    expect(history.improvementPercent).toBe(20)
  })

  it('finds the real best session even when it is not the latest', () => {
    const history = computeReportHistory([
      session({ occurredAt: '2026-01-03T00:00:00.000Z', report: report(50) }),
      session({ occurredAt: '2026-01-02T00:00:00.000Z', report: report(95) }),
      session({ occurredAt: '2026-01-01T00:00:00.000Z', report: report(70) }),
    ])
    expect(history.bestSession?.report.observationAccuracy).toBe(95)
  })

  it('skips sessions from other missions and sessions without a level number', () => {
    const history = computeReportHistory([
      session({ missionId: 'image-persistence-challenge', report: report(99) }),
      session({ levelNumber: null, report: report(99) }),
      session({ occurredAt: '2026-01-01T00:00:00.000Z', report: report(40) }),
    ])
    expect(history.latestSession?.report.observationAccuracy).toBe(40)
  })
})
