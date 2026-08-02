import { describe, expect, it } from 'vitest'
import { MockLearningPatternAnalyzer } from './mockLearningPatternAnalyzer'
import { makeMentorActivitySnapshot } from '../testFixtures'

describe('MockLearningPatternAnalyzer', () => {
  it('reports "No study pattern yet" when no study modes have been used', async () => {
    const analyzer = new MockLearningPatternAnalyzer()
    const insight = await analyzer.analyze(makeMentorActivitySnapshot({ studyModesUsed: [] }))
    expect(insight.summary).toBe('No study pattern yet')
    expect(insight.type).toBe('pattern')
  })

  it('names the single mode when only one has been used', async () => {
    const analyzer = new MockLearningPatternAnalyzer()
    const insight = await analyzer.analyze(makeMentorActivitySnapshot({ studyModesUsed: ['quiz', 'quiz'] }))
    expect(insight.summary).toBe('Focused on quiz')
  })

  it('reports mixing multiple modes and lists them all in the detail', async () => {
    const analyzer = new MockLearningPatternAnalyzer()
    const insight = await analyzer.analyze(makeMentorActivitySnapshot({ studyModesUsed: ['quiz', 'flashcard'] }))
    expect(insight.summary).toBe('Mixing multiple study modes')
    expect(insight.detail).toContain('quiz')
    expect(insight.detail).toContain('flashcard')
  })

  it('deduplicates repeated modes when counting', async () => {
    const analyzer = new MockLearningPatternAnalyzer()
    const insight = await analyzer.analyze(makeMentorActivitySnapshot({ studyModesUsed: ['quiz', 'quiz', 'quiz'] }))
    expect(insight.detail).toContain('1 different study mode')
  })
})
