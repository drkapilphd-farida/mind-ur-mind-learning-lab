import { describe, expect, it } from 'vitest'
import { computeMemoryIntelligenceReport, type MemoryIntelligenceInputs } from './memoryIntelligenceEngine'

const BASE_INPUTS: MemoryIntelligenceInputs = {
  visualScore: 0.5,
  numberScore: 0.5,
  wordScore: 0.5,
  patternScore: 0.5,
  recognitionScore: 0.5,
  digitSpanRoundsCompleted: 6,
}

describe('computeMemoryIntelligenceReport', () => {
  it('FIX-01 — a real, clearly-dominant visual score produces the Visual Thinker profile', () => {
    const report = computeMemoryIntelligenceReport({ ...BASE_INPUTS, visualScore: 0.9, wordScore: 0.3, numberScore: 0.3, patternScore: 0.3, recognitionScore: 0.3 })
    expect(report.profileLabel).toBe('🧠 Visual Thinker')
  })

  it('FIX-01 — real, evenly-matched scores across every domain produce Balanced Rememberer', () => {
    const report = computeMemoryIntelligenceReport({ ...BASE_INPUTS, visualScore: 0.5, numberScore: 0.52, wordScore: 0.48, patternScore: 0.5, recognitionScore: 0.51 })
    expect(report.profileLabel).toBe('⚖️ Balanced Rememberer')
  })

  it('FIX-02 — efficiency is a real average of every real domain score, never fabricated', () => {
    const report = computeMemoryIntelligenceReport({ ...BASE_INPUTS, visualScore: 1, numberScore: 1, wordScore: 1, patternScore: 1, recognitionScore: 1 })
    expect(report.efficiencyPercent).toBe(100)
  })

  it('FIX-03/FIX-04 — the real highest domain becomes the strength, the real lowest becomes the opportunity', () => {
    const report = computeMemoryIntelligenceReport({ ...BASE_INPUTS, visualScore: 0.9, numberScore: 0.1, wordScore: 0.5, patternScore: 0.5, recognitionScore: 0.5 })
    expect(report.strongestSkillLabel).toBe('👀 Visual Memory')
    expect(report.growthOpportunityLabel).toBe('Number Recall')
  })

  it('FIX-04 — growth opportunity language never uses judgmental words', () => {
    const report = computeMemoryIntelligenceReport({ ...BASE_INPUTS, visualScore: 0.9, numberScore: 0.1, wordScore: 0.5, patternScore: 0.5, recognitionScore: 0.5 })
    expect(report.growthOpportunityLabel).not.toMatch(/weak|poor|low/i)
  })

  it('FIX-05 — a real visual-over-verbal gap produces the brief\'s own exact insight', () => {
    const report = computeMemoryIntelligenceReport({ ...BASE_INPUTS, visualScore: 0.9, wordScore: 0.5, numberScore: 0.5, patternScore: 0.5, recognitionScore: 0.5 })
    expect(report.personalInsight).toBe('You remembered visual information much faster than verbal information.')
  })

  it('FIX-05 — real balanced performance produces the brief\'s own exact consistency insight', () => {
    const report = computeMemoryIntelligenceReport(BASE_INPUTS)
    expect(report.personalInsight).toContain('consistently across every challenge')
  })

  it('FIX-06 — a real recognition-over-recall gap produces the brief\'s own exact pattern summary', () => {
    const report = computeMemoryIntelligenceReport({ ...BASE_INPUTS, recognitionScore: 0.9, wordScore: 0.3, numberScore: 0.3, visualScore: 0.3, patternScore: 0.3 })
    expect(report.patternSummary).toBe('You naturally recognize information faster than you actively recall it.')
  })

  it('FIX-07 — fewer real completed Digit Span rounds lowers real confidence, never fabricated', () => {
    const high = computeMemoryIntelligenceReport({ ...BASE_INPUTS, digitSpanRoundsCompleted: 7 })
    const moderate = computeMemoryIntelligenceReport({ ...BASE_INPUTS, digitSpanRoundsCompleted: 4 })
    const low = computeMemoryIntelligenceReport({ ...BASE_INPUTS, digitSpanRoundsCompleted: 1 })
    expect(high.confidenceLevel).toBe('High Confidence')
    expect(moderate.confidenceLevel).toBe('Moderate Confidence')
    expect(low.confidenceLevel).toBe('Needs More Sessions')
  })

  it('FIX-08 — different real inputs produce genuinely different real reports', () => {
    const reportA = computeMemoryIntelligenceReport({ ...BASE_INPUTS, visualScore: 0.9, wordScore: 0.1 })
    const reportB = computeMemoryIntelligenceReport({ ...BASE_INPUTS, numberScore: 0.9, patternScore: 0.1 })
    expect(reportA.profileLabel).not.toBe(reportB.profileLabel)
  })

  it('is deterministic for the same real inputs', () => {
    expect(computeMemoryIntelligenceReport(BASE_INPUTS)).toEqual(computeMemoryIntelligenceReport(BASE_INPUTS))
  })
})
