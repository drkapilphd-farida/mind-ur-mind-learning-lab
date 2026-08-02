import { describe, expect, it } from 'vitest'
import { MockWeaknessDetector } from './mockWeaknessDetector'
import { makeMentorActivitySnapshot } from '../testFixtures'

describe('MockWeaknessDetector', () => {
  it('returns nothing when there is no session data yet', async () => {
    const detector = new MockWeaknessDetector()
    const insights = await detector.detect(makeMentorActivitySnapshot({ sessionCount: 0 }))
    expect(insights).toEqual([])
  })

  it('flags limited active recall when only passive modes have been used', async () => {
    const detector = new MockWeaknessDetector()
    const insights = await detector.detect(makeMentorActivitySnapshot({ sessionCount: 2, studyModesUsed: ['summary', 'mind-map'] }))
    expect(insights).toHaveLength(1)
    expect(insights[0]).toMatchObject({ type: 'weakness', summary: 'Limited active recall practice' })
  })

  it('returns nothing once any active-recall mode has been used', async () => {
    const detector = new MockWeaknessDetector()
    const insights = await detector.detect(makeMentorActivitySnapshot({ sessionCount: 2, studyModesUsed: ['summary', 'quiz'] }))
    expect(insights).toEqual([])
  })

  it('never claims a weakness in a specific concept — no per-concept claim exists', async () => {
    const detector = new MockWeaknessDetector()
    const insights = await detector.detect(makeMentorActivitySnapshot({ sessionCount: 2, studyModesUsed: [], conceptsEncountered: ['Photosynthesis'] }))
    for (const insight of insights) {
      expect(insight.summary).not.toContain('Photosynthesis')
      expect(insight.detail).not.toContain('Photosynthesis')
    }
  })
})
