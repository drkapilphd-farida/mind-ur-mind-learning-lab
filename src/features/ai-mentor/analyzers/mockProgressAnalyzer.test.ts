import { describe, expect, it } from 'vitest'
import { MockProgressAnalyzer } from './mockProgressAnalyzer'
import { makeMentorActivitySnapshot } from '../testFixtures'

describe('MockProgressAnalyzer', () => {
  it('reports "Just getting started" when no concepts have been encountered', async () => {
    const analyzer = new MockProgressAnalyzer()
    const insight = await analyzer.analyze(makeMentorActivitySnapshot({ conceptsEncountered: [] }))
    expect(insight.summary).toBe('Just getting started')
    expect(insight.type).toBe('progress')
  })

  it('reports "Making steady progress" for three or more concepts', async () => {
    const analyzer = new MockProgressAnalyzer()
    const insight = await analyzer.analyze(makeMentorActivitySnapshot({ conceptsEncountered: ['a', 'b', 'c'] }))
    expect(insight.summary).toBe('Making steady progress')
  })

  it('includes the real concept and session counts in the detail', async () => {
    const analyzer = new MockProgressAnalyzer()
    const insight = await analyzer.analyze(makeMentorActivitySnapshot({ conceptsEncountered: ['a', 'b'], sessionCount: 4 }))
    expect(insight.detail).toContain('2 concepts')
    expect(insight.detail).toContain('4 sessions')
  })

  it('is deterministic for the same snapshot', async () => {
    const analyzer = new MockProgressAnalyzer()
    const snapshot = makeMentorActivitySnapshot()
    expect(await analyzer.analyze(snapshot)).toEqual(await analyzer.analyze(snapshot))
  })
})
