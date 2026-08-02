import { describe, it, expect } from 'vitest'
import { generateImprovementTips } from './improvementTipsEngine'
import { buildSession } from './testFixtures'

describe('generateImprovementTips', () => {
  it('returns no tips for a strong, consistent session', () => {
    const tips = generateImprovementTips(buildSession({ wpm: 250, comprehensionPercent: 90, accuracyPercent: 90 }), [])
    expect(tips).toHaveLength(0)
  })

  it('suggests phrase grouping when speed is well below the passage target', () => {
    // easy target is 200 WPM
    const tips = generateImprovementTips(buildSession({ difficulty: 'easy', wpm: 100 }), [])
    expect(tips.some((t) => t.includes('phrase grouping'))).toBe(true)
  })

  it('suggests reducing speed when comprehension is low', () => {
    const tips = generateImprovementTips(buildSession({ comprehensionPercent: 50 }), [])
    expect(tips.some((t) => t.includes('Reduce speed'))).toBe(true)
  })

  it('suggests attention to transitions when accuracy is low', () => {
    const tips = generateImprovementTips(buildSession({ accuracyPercent: 50 }), [])
    expect(tips.some((t) => t.includes('transition sentences'))).toBe(true)
  })

  it('flags inconsistent reading time across recent sessions', () => {
    const recent = [buildSession({ readingTimeMs: 20_000 }), buildSession({ readingTimeMs: 120_000 })]
    const tips = generateImprovementTips(buildSession({ readingTimeMs: 60_000 }), recent)
    expect(tips.some((t) => t.includes('first paragraph'))).toBe(true)
  })

  it('does not flag inconsistency with too little history', () => {
    const tips = generateImprovementTips(buildSession({ readingTimeMs: 60_000 }), [])
    expect(tips.some((t) => t.includes('first paragraph'))).toBe(false)
  })

  it('can return multiple applicable tips at once', () => {
    const tips = generateImprovementTips(buildSession({ difficulty: 'easy', wpm: 50, comprehensionPercent: 40, accuracyPercent: 40 }), [])
    expect(tips.length).toBeGreaterThanOrEqual(3)
  })
})
