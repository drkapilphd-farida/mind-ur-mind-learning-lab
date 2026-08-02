import { describe, expect, it } from 'vitest'
import { MockStrengthDetector } from './mockStrengthDetector'
import { makeMentorActivitySnapshot } from '../testFixtures'

describe('MockStrengthDetector', () => {
  it('returns nothing when there is not enough signal', async () => {
    const detector = new MockStrengthDetector()
    const insights = await detector.detect(makeMentorActivitySnapshot({ sessionCount: 1, studyModesUsed: [] }))
    expect(insights).toEqual([])
  })

  it('flags consistency at three or more sessions', async () => {
    const detector = new MockStrengthDetector()
    const insights = await detector.detect(makeMentorActivitySnapshot({ sessionCount: 3, studyModesUsed: [] }))
    expect(insights.some((insight) => insight.summary === 'Consistent study habit')).toBe(true)
  })

  it('flags active recall usage', async () => {
    const detector = new MockStrengthDetector()
    const insights = await detector.detect(makeMentorActivitySnapshot({ sessionCount: 1, studyModesUsed: ['flashcard'] }))
    expect(insights.some((insight) => insight.summary === 'Practicing active recall')).toBe(true)
  })

  it('can report both strengths at once when both signals are present', async () => {
    const detector = new MockStrengthDetector()
    const insights = await detector.detect(makeMentorActivitySnapshot({ sessionCount: 5, studyModesUsed: ['quiz'] }))
    expect(insights).toHaveLength(2)
  })
})
