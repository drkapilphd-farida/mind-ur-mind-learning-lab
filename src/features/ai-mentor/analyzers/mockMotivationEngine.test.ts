import { describe, expect, it } from 'vitest'
import { MockMotivationEngine } from './mockMotivationEngine'
import { makeMentorActivitySnapshot } from '../testFixtures'

describe('MockMotivationEngine', () => {
  it('reports "Ready to begin" for zero sessions', async () => {
    const engine = new MockMotivationEngine()
    const insight = await engine.assess(makeMentorActivitySnapshot({ sessionCount: 0 }))
    expect(insight.summary).toBe('Ready to begin')
    expect(insight.type).toBe('motivation')
  })

  it('reports "Building a habit" for one or two sessions', async () => {
    const engine = new MockMotivationEngine()
    const insight = await engine.assess(makeMentorActivitySnapshot({ sessionCount: 1 }))
    expect(insight.summary).toBe('Building a habit')
  })

  it('reports "Strong momentum" for three or more sessions', async () => {
    const engine = new MockMotivationEngine()
    const insight = await engine.assess(makeMentorActivitySnapshot({ sessionCount: 3 }))
    expect(insight.summary).toBe('Strong momentum')
  })
})
