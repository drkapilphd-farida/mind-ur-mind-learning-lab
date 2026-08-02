import { describe, it, expect } from 'vitest'
import { generateSessionFeedbackReport } from './sessionFeedbackEngine'
import { buildSession } from './testFixtures'

describe('generateSessionFeedbackReport', () => {
  it('rates a high-score session as Excellent Reading Session', () => {
    const report = generateSessionFeedbackReport(buildSession({ readingIntelligenceScore: 90 }), [])
    expect(report.overallPerformance.verdict).toBe('excellent')
    expect(report.overallPerformance.label).toBe('Excellent Reading Session')
  })

  it('rates a mid-score session as Good Progress', () => {
    const report = generateSessionFeedbackReport(buildSession({ readingIntelligenceScore: 70 }), [])
    expect(report.overallPerformance.verdict).toBe('good')
  })

  it('rates a low-score session as Needs More Practice', () => {
    const report = generateSessionFeedbackReport(buildSession({ readingIntelligenceScore: 40 }), [])
    expect(report.overallPerformance.verdict).toBe('needs-practice')
  })

  it('reports a real speed increase versus the recent average', () => {
    const recent = [buildSession({ wpm: 200 }), buildSession({ wpm: 200 })]
    const report = generateSessionFeedbackReport(buildSession({ wpm: 222 }), recent)
    expect(report.speedFeedback).toContain('11%')
    expect(report.speedFeedback).toContain('increased')
  })

  it('handles a first session with no recent history honestly', () => {
    const report = generateSessionFeedbackReport(buildSession({ wpm: 200 }), [])
    expect(report.speedFeedback).toContain('200 WPM')
    expect(report.comprehensionFeedback).toContain('first tracked session')
  })

  it('flags reading too fast for comprehension', () => {
    const report = generateSessionFeedbackReport(buildSession({ wpm: 300, comprehensionPercent: 60 }), [])
    expect(report.readingBalance.kind).toBe('too-fast')
  })

  it('flags excellent balance when comprehension is strong and speed is moderate', () => {
    const report = generateSessionFeedbackReport(buildSession({ wpm: 200, comprehensionPercent: 90 }), [])
    expect(report.readingBalance.kind).toBe('excellent-balance')
  })

  it('reports perfect accuracy explicitly', () => {
    const report = generateSessionFeedbackReport(buildSession({ accuracyPercent: 100 }), [])
    expect(report.accuracyFeedback).toContain('every question correctly')
  })

  it('produces a non-empty, natural 2-3 sentence summary', () => {
    const report = generateSessionFeedbackReport(buildSession(), [])
    const sentenceCount = report.summary.split('.').filter((s) => s.trim().length > 0).length
    expect(sentenceCount).toBeGreaterThanOrEqual(2)
    expect(sentenceCount).toBeLessThanOrEqual(3)
  })
})
