import { describe, expect, it } from 'vitest'
import { createSkillGapAnalyzer } from './DefaultSkillGapAnalyzer'
import { makeLearnerProfile } from '../testFixtures'

describe('DefaultSkillGapAnalyzer', () => {
  const analyzer = createSkillGapAnalyzer()

  it('produces exactly 3 gaps: reading, memory, focus', () => {
    const gaps = analyzer.analyze(makeLearnerProfile())
    expect(gaps.map((gap) => gap.skill)).toEqual(['reading', 'memory', 'focus'])
  })

  it('a beginner level has the maximum gapScore (100)', () => {
    const gaps = analyzer.analyze(makeLearnerProfile({ readingLevel: 'beginner' }))
    expect(gaps.find((gap) => gap.skill === 'reading')?.gapScore).toBe(100)
  })

  it('an expert level has a zero gapScore', () => {
    const gaps = analyzer.analyze(makeLearnerProfile({ memoryLevel: 'expert' }))
    expect(gaps.find((gap) => gap.skill === 'memory')?.gapScore).toBe(0)
  })

  it('an intermediate level has a smaller gap than beginner', () => {
    const gaps = analyzer.analyze(makeLearnerProfile({ focusLevel: 'intermediate' }))
    const focusGap = gaps.find((gap) => gap.skill === 'focus')?.gapScore ?? 0
    expect(focusGap).toBeLessThan(100)
    expect(focusGap).toBeGreaterThan(0)
  })

  it('never invents a gap for a skill not in the profile', () => {
    const gaps = analyzer.analyze(makeLearnerProfile())
    expect(gaps).toHaveLength(3)
  })
})
