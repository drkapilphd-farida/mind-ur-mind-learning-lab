import { describe, it, expect } from 'vitest'
import { buildPeripheralFlashRecommendation } from './peripheralFlashRecommendation'

describe('buildPeripheralFlashRecommendation — side-aware coaching', () => {
  it('names a genuinely weaker side in the coach paragraph', () => {
    const recommendation = buildPeripheralFlashRecommendation({
      accuracyPercent: 80,
      averageVisualSpan: 1,
      visualSpanGrew: null,
      currentTier: 'beginner',
      nextTier: 'beginner',
      nextTrainingLevel: 1,
      promoted: false,
      recovered: false,
      weakerSide: 'left',
    })
    expect(recommendation.coachParagraph).toContain('Your left peripheral recognition is currently behind your right')
    expect(recommendation.coachParagraph).toContain('balance both sides')
  })

  it('never mentions a side when weakerSide is null (tie, small gap, or not enough data)', () => {
    const recommendation = buildPeripheralFlashRecommendation({
      accuracyPercent: 90,
      averageVisualSpan: 2,
      visualSpanGrew: true,
      currentTier: 'medium',
      nextTier: 'advanced',
      nextTrainingLevel: 3,
      promoted: true,
      recovered: false,
      weakerSide: null,
    })
    expect(recommendation.coachParagraph).not.toContain('peripheral recognition is currently behind')
    expect(recommendation.coachParagraph).not.toContain('balance both sides')
  })

  it('always connects the session to chunk reading and multi-line reading', () => {
    const recommendation = buildPeripheralFlashRecommendation({
      accuracyPercent: 70,
      averageVisualSpan: 1,
      visualSpanGrew: false,
      currentTier: 'beginner',
      nextTier: 'beginner',
      nextTrainingLevel: 1,
      promoted: false,
      recovered: false,
      weakerSide: null,
    })
    expect(recommendation.coachParagraph).toContain('chunk reading')
    expect(recommendation.coachParagraph).toContain('multi-line reading')
  })
})
