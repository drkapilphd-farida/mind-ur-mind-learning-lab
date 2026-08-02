import { describe, expect, it } from 'vitest'
import { computeVisualAnalytics } from './visualAnalytics'

const BEST_ANSWERS = {
  gazeStability: 'very-stable' as const,
  afterImageClarity: 'very-clear' as const,
  afterImageDuration: 'more-than-10s' as const,
  centerFocusEase: 'yes' as const,
}

const WORST_ANSWERS = {
  gazeStability: 'could-not-maintain' as const,
  afterImageClarity: 'none' as const,
  afterImageDuration: 'not-observed' as const,
  centerFocusEase: 'difficult' as const,
}

describe('computeVisualAnalytics', () => {
  it('returns 100 across every score when everything is maximally positive', () => {
    const result = computeVisualAnalytics({
      ...BEST_ANSWERS,
      completedLevelsCount: 5,
      totalLevelsCount: 5,
      totalDurationSeconds: 300,
    })
    expect(result).toEqual({
      fixationStability: 100,
      afterImageAwareness: 100,
      observationQuality: 100,
      visualEndurance: 100,
      sessionConfidence: 100,
    })
  })

  it('returns 0 across every score when everything is maximally negative', () => {
    const result = computeVisualAnalytics({
      ...WORST_ANSWERS,
      completedLevelsCount: 0,
      totalLevelsCount: 5,
      totalDurationSeconds: 0,
    })
    expect(result).toEqual({
      fixationStability: 0,
      afterImageAwareness: 0,
      observationQuality: 0,
      visualEndurance: 0,
      sessionConfidence: 0,
    })
  })

  it('never fabricates endurance progress beyond real completed levels', () => {
    const result = computeVisualAnalytics({
      ...BEST_ANSWERS,
      completedLevelsCount: 1,
      totalLevelsCount: 5,
      totalDurationSeconds: 0,
    })
    // breadth: (1/5)*0.6=0.12, duration: 0 -> 12
    expect(result.visualEndurance).toBe(12)
  })

  it('caps visual endurance duration contribution at 300 seconds', () => {
    const result = computeVisualAnalytics({
      ...BEST_ANSWERS,
      completedLevelsCount: 0,
      totalLevelsCount: 5,
      totalDurationSeconds: 999_999,
    })
    // breadth: 0, duration: capped at 1 * 0.4 = 40
    expect(result.visualEndurance).toBe(40)
  })

  it('computes session confidence as the plain average of all 4 answer ratios', () => {
    const result = computeVisualAnalytics({
      gazeStability: 'mostly-stable',
      afterImageClarity: 'moderate',
      afterImageDuration: '5-10s',
      centerFocusEase: 'sometimes',
      completedLevelsCount: 0,
      totalLevelsCount: 5,
      totalDurationSeconds: 0,
    })
    // (0.66+0.66+0.66+0.5)/4 = 0.62 -> 62
    expect(result.sessionConfidence).toBe(62)
  })

  it('derives Fixation Stability™ from the real measured duration ratio when gaze/center were never asked', () => {
    const result = computeVisualAnalytics({
      gazeStability: null,
      afterImageClarity: 'very-clear',
      afterImageDuration: 'more-than-10s',
      centerFocusEase: null,
      completedLevelsCount: 0,
      totalLevelsCount: 5,
      totalDurationSeconds: 0,
      measuredAfterImageDurationRatio: 0.8,
    })
    expect(result.fixationStability).toBe(80)
  })

  it('uses the real measured duration ratio (not the coarser bucket) for observationQuality when provided', () => {
    const result = computeVisualAnalytics({
      gazeStability: null,
      afterImageClarity: 'very-clear',
      afterImageDuration: 'more-than-10s',
      centerFocusEase: null,
      completedLevelsCount: 0,
      totalLevelsCount: 5,
      totalDurationSeconds: 0,
      measuredAfterImageDurationRatio: 0.4,
    })
    // 0.5*1 (clarity) + 0.5*0.4 (real measured ratio, not the bucket's 1.0) = 0.7 -> 70
    expect(result.observationQuality).toBe(70)
  })

  it('averages only the real ratios actually collected for sessionConfidence when gaze/center are null', () => {
    const result = computeVisualAnalytics({
      gazeStability: null,
      afterImageClarity: 'very-clear',
      afterImageDuration: 'more-than-10s',
      centerFocusEase: null,
      completedLevelsCount: 0,
      totalLevelsCount: 5,
      totalDurationSeconds: 0,
      measuredAfterImageDurationRatio: 0.5,
    })
    // (clarity 1 + duration 0.5) / 2 = 0.75 -> 75, never diluted by fabricated gaze/center values
    expect(result.sessionConfidence).toBe(75)
  })
})
