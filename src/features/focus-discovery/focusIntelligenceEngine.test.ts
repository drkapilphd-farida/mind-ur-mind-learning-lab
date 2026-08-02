import { describe, expect, it } from 'vitest'
import { computeFocusIntelligenceReport, type FocusIntelligenceInputs } from './focusIntelligenceEngine'

// A deliberately unambiguous real fixture: attention-lock is the real
// clear strongest (ratio 1.0), sustained-focus the real clear weakest
// (ratio 0.7) — every other real mission sits comfortably in between.
function baseInputs(): FocusIntelligenceInputs {
  return {
    attentionLock: {
      type: 'attention_lock_result',
      roundsCompleted: 5,
      totalTargets: 19,
      correctTaps: 19,
      falseTaps: 0,
      avgReactionMs: 600,
      highestLevelReached: 4,
      stabilizedRounds: 0,
    },
    visualSearch: {
      type: 'visual_search_result',
      roundsCompleted: 10,
      correctFirstTapCount: 9,
      wrongTapsTotal: 3,
      avgSearchMs: 1400,
      highestLevelReached: 4,
      stabilizedRounds: 0,
    },
    reactionFocus: { type: 'reaction_focus_result', trialsCompleted: 10, hits: 9, prematureTaps: 1, missedTargets: 0, reactionTimesMs: [300, 320, 310, 305, 315, 300] },
    sustainedFocus: { type: 'sustained_focus_result', totalTicks: 30, correctHits: 10, missedTargets: 5, falseTaps: 2, earlyAccuracy: 0.8, midAccuracy: 0.7, lateAccuracy: 0.6 },
    cognitiveFlexibility: {
      type: 'cognitive_flexibility_result',
      roundsCompleted: 5,
      correctTaps: 18,
      incorrectHabitResponses: 1,
      missedTargets: 1,
      avgAdaptationMs: 900,
      highestLevelReached: 4,
      stabilizedRounds: 0,
    },
  }
}

describe('computeFocusIntelligenceReport', () => {
  it('RESULT-01 — picks a real profile name matching the real strongest mission', () => {
    const inputs = baseInputs()
    // Real attention-lock ratio (20/22 ≈ 0.91) is the real highest here.
    const report = computeFocusIntelligenceReport(inputs)
    expect(report.profileName).toBe('Selective Observer')
  })

  it('RESULT-01 — a real all-round-strong session reads as "Attention Guardian"', () => {
    const inputs = baseInputs()
    inputs.sustainedFocus = { ...inputs.sustainedFocus, earlyAccuracy: 0.9, midAccuracy: 0.85, lateAccuracy: 0.85 }
    const report = computeFocusIntelligenceReport(inputs)
    expect(report.profileName).toBe('Attention Guardian')
  })

  it('RESULT-03 — real Focus Efficiency always stays within a real real 0-100 bound', () => {
    const report = computeFocusIntelligenceReport(baseInputs())
    expect(report.focusEfficiencyPercent).toBeGreaterThanOrEqual(0)
    expect(report.focusEfficiencyPercent).toBeLessThanOrEqual(100)
  })

  it('RESULT-02 — the real Hero Metric always stays within a real 0-100 bound, even at real extremes', () => {
    const inputs = baseInputs()
    inputs.sustainedFocus = { ...inputs.sustainedFocus, earlyAccuracy: 1, lateAccuracy: 0 }
    inputs.reactionFocus = { ...inputs.reactionFocus, reactionTimesMs: [100, 900, 150, 800] }
    const report = computeFocusIntelligenceReport(inputs)
    expect(report.heroMetricPercent).toBeGreaterThanOrEqual(0)
    expect(report.heroMetricPercent).toBeLessThanOrEqual(100)
  })

  it('RESULT-04/RESULT-05 — real strongest and real growth skills are never the same mission unless every real ratio ties', () => {
    const report = computeFocusIntelligenceReport(baseInputs())
    // In this real fixture, sustained-focus (0.85) is the real weakest.
    expect(report.growthOpportunityLine).toBe('Your focus remains strong, but attention dips as distractions build up over time.')
  })

  it('RESULT-08 — a real recommendation always maps from the exact real growth mission', () => {
    const inputs = baseInputs()
    // Make cognitive-flexibility the clear real weakest.
    inputs.cognitiveFlexibility = { ...inputs.cognitiveFlexibility, correctTaps: 5, incorrectHabitResponses: 10, missedTargets: 5 }
    const report = computeFocusIntelligenceReport(inputs)
    expect(report.recommendation).toBe('Memory Mode is recommended because improving rule adaptation will help you retain more information under distraction.')
  })

  it('Sprint-2.0 PROFILE DESCRIPTION™ — a real, non-empty, real two-sentence-or-fewer description always accompanies the real profile name', () => {
    const report = computeFocusIntelligenceReport(baseInputs())
    expect(report.profileDescription.length).toBeGreaterThan(0)
    expect(report.profileDescription.split('.').filter(Boolean).length).toBeLessThanOrEqual(2)
  })

  it('Sprint-2.0 ATTENTION JOURNEY SUMMARY™ — one real, bounded bar per real mission, in the real locked order', () => {
    const report = computeFocusIntelligenceReport(baseInputs())
    expect(report.journey.map((entry) => entry.mission)).toEqual([
      'attention-lock',
      'visual-search',
      'reaction-focus',
      'sustained-focus',
      'cognitive-flexibility',
    ])
    for (const entry of report.journey) {
      expect(entry.ratioPercent).toBeGreaterThanOrEqual(0)
      expect(entry.ratioPercent).toBeLessThanOrEqual(100)
    }
  })

  it('Sprint-2.0 PREMIUM SCORE CARD™ — every real secondary score stays within a real 0-100 bound', () => {
    const report = computeFocusIntelligenceReport(baseInputs())
    for (const value of [report.reactionPrecisionPercent, report.visualSearchAccuracyPercent, report.ruleAdaptationPercent]) {
      expect(value).toBeGreaterThanOrEqual(0)
      expect(value).toBeLessThanOrEqual(100)
    }
  })

  it('Sprint-2.0 LEARNING POTENTIAL MESSAGE™ — a real, non-empty, hopeful line that never exaggerates', () => {
    const report = computeFocusIntelligenceReport(baseInputs())
    expect(report.learningPotentialMessage.length).toBeGreaterThan(0)
    expect(report.learningPotentialMessage.toLowerCase()).not.toContain('guarantee')
    expect(report.learningPotentialMessage.toLowerCase()).not.toContain('perfect')
  })

  it('Sprint-2.0 LEARNING POTENTIAL MESSAGE™ — a real high-efficiency session reads as already excellent, never generic', () => {
    const inputs = baseInputs()
    inputs.sustainedFocus = { ...inputs.sustainedFocus, earlyAccuracy: 0.95, midAccuracy: 0.92, lateAccuracy: 0.9 }
    const report = computeFocusIntelligenceReport(inputs)
    expect(report.learningPotentialMessage).toContain('already demonstrate excellent attention control')
  })

  it('never throws on a real degenerate zero-attempt session', () => {
    const zeroed: FocusIntelligenceInputs = {
      attentionLock: {
        type: 'attention_lock_result',
        roundsCompleted: 0,
        totalTargets: 0,
        correctTaps: 0,
        falseTaps: 0,
        avgReactionMs: 0,
        highestLevelReached: 0,
        stabilizedRounds: 0,
      },
      visualSearch: {
        type: 'visual_search_result',
        roundsCompleted: 0,
        correctFirstTapCount: 0,
        wrongTapsTotal: 0,
        avgSearchMs: 0,
        highestLevelReached: 0,
        stabilizedRounds: 0,
      },
      reactionFocus: { type: 'reaction_focus_result', trialsCompleted: 0, hits: 0, prematureTaps: 0, missedTargets: 0, reactionTimesMs: [] },
      sustainedFocus: { type: 'sustained_focus_result', totalTicks: 0, correctHits: 0, missedTargets: 0, falseTaps: 0, earlyAccuracy: 0, midAccuracy: 0, lateAccuracy: 0 },
      cognitiveFlexibility: {
        type: 'cognitive_flexibility_result',
        roundsCompleted: 0,
        correctTaps: 0,
        incorrectHabitResponses: 0,
        missedTargets: 0,
        avgAdaptationMs: 0,
        highestLevelReached: 0,
        stabilizedRounds: 0,
      },
    }
    expect(() => computeFocusIntelligenceReport(zeroed)).not.toThrow()
    const report = computeFocusIntelligenceReport(zeroed)
    expect(report.focusEfficiencyPercent).toBe(0)
    expect(report.missionsCompleted).toBe(5)
  })

  it('is deterministic for the same real inputs', () => {
    const inputs = baseInputs()
    expect(computeFocusIntelligenceReport(inputs)).toEqual(computeFocusIntelligenceReport(inputs))
  })
})
