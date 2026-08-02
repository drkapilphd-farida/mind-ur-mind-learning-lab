import { describe, expect, it } from 'vitest'
import { createDifficultyRecommendationEngine } from './DefaultDifficultyRecommendationEngine'
import { createSkillGapAnalyzer } from '../skillGap'
import { makeLearnerProfile } from '../testFixtures'

describe('DefaultDifficultyRecommendationEngine', () => {
  const engine = createDifficultyRecommendationEngine()
  const skillGapAnalyzer = createSkillGapAnalyzer()

  it('recommends the weakest skill level as the base difficulty', () => {
    const profile = makeLearnerProfile({ readingLevel: 'beginner', memoryLevel: 'advanced', focusLevel: 'expert', journeyProgressPercent: 10 })
    const gaps = skillGapAnalyzer.analyze(profile)
    expect(engine.recommend(profile, gaps)).toBe('beginner')
  })

  it('bumps up one tier when journeyProgressPercent is high (>= 80)', () => {
    const profile = makeLearnerProfile({ readingLevel: 'beginner', memoryLevel: 'beginner', focusLevel: 'beginner', journeyProgressPercent: 85 })
    const gaps = skillGapAnalyzer.analyze(profile)
    expect(engine.recommend(profile, gaps)).toBe('intermediate')
  })

  it('never bumps past expert', () => {
    const profile = makeLearnerProfile({ readingLevel: 'expert', memoryLevel: 'expert', focusLevel: 'expert', journeyProgressPercent: 100 })
    const gaps = skillGapAnalyzer.analyze(profile)
    expect(engine.recommend(profile, gaps)).toBe('expert')
  })

  it('does not bump when journeyProgressPercent is below the threshold', () => {
    const profile = makeLearnerProfile({ readingLevel: 'intermediate', memoryLevel: 'intermediate', focusLevel: 'intermediate', journeyProgressPercent: 50 })
    const gaps = skillGapAnalyzer.analyze(profile)
    expect(engine.recommend(profile, gaps)).toBe('intermediate')
  })

  it('defaults to beginner for an empty skillGaps list', () => {
    const profile = makeLearnerProfile()
    expect(engine.recommend(profile, [])).toBe('beginner')
  })
})
