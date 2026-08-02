import { describe, it, expect } from 'vitest'
import { buildMixedFlashRecommendation } from './mixedFlashRecommendation'
import type { StimulusTypeBreakdown } from './mixedFlashEngine'

// Regression test for a real bug found in live testing: when every
// stimulus type scored equally well, findWeakestStimulusType still
// returned a type (a tie-break artifact), and the coach paragraph said
// "Word recognition needs more practice" even though it was 17/17 (100%).
describe('buildMixedFlashRecommendation — weak-type callout', () => {
  it('does not call out a type as needing practice when every type performed equally well', () => {
    const perfectBreakdown: StimulusTypeBreakdown = {
      word: { correct: 17, total: 17 },
      number: { correct: 1, total: 1 },
      symbol: { correct: 2, total: 2 },
    }
    const recommendation = buildMixedFlashRecommendation({
      accuracyPercent: 100,
      currentTier: 'beginner',
      nextTier: 'easy',
      promoted: true,
      recovered: false,
      breakdown: perfectBreakdown,
      weakestType: 'word', // as findWeakestStimulusType would actually return (tie-break)
      strongestType: 'word',
    })
    expect(recommendation.coachParagraph).not.toContain('needs more practice')
  })

  it('does call out a genuinely weak type when there is a real gap', () => {
    const gappyBreakdown: StimulusTypeBreakdown = {
      word: { correct: 10, total: 10 },
      number: { correct: 2, total: 8 },
      symbol: { correct: 5, total: 6 },
    }
    const recommendation = buildMixedFlashRecommendation({
      accuracyPercent: 70,
      currentTier: 'beginner',
      nextTier: 'beginner',
      promoted: false,
      recovered: false,
      breakdown: gappyBreakdown,
      weakestType: 'number',
      strongestType: 'word',
    })
    expect(recommendation.coachParagraph).toContain('Number recognition needs more practice')
    expect(recommendation.coachParagraph).toContain('2/8')
  })

  it('does not call out a weak type below the shortfall threshold even with some gap', () => {
    // 85% vs 100% — a real gap in points, but 85% itself isn't a weak
    // performance worth flagging as "needs more practice."
    const closeBreakdown: StimulusTypeBreakdown = {
      word: { correct: 10, total: 10 },
      number: { correct: 17, total: 20 }, // 85%
      symbol: { correct: 8, total: 8 },
    }
    const recommendation = buildMixedFlashRecommendation({
      accuracyPercent: 90,
      currentTier: 'beginner',
      nextTier: 'beginner',
      promoted: false,
      recovered: false,
      breakdown: closeBreakdown,
      weakestType: 'number',
      strongestType: 'word',
    })
    expect(recommendation.coachParagraph).not.toContain('needs more practice')
  })
})
