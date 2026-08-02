import { describe, expect, it } from 'vitest'
import { MockGoalTrackingEngine } from './mockGoalTrackingEngine'
import { makeMentorActivitySnapshot } from '../testFixtures'

describe('MockGoalTrackingEngine', () => {
  it('never claims a goal exists — no goal field exists on the snapshot', async () => {
    const engine = new MockGoalTrackingEngine()
    const insight = await engine.track(makeMentorActivitySnapshot({ sessionCount: 5 }))
    expect(insight.type).toBe('goal')
    expect(insight.summary).toBe('No goal set yet')
  })

  it('invites goal-setting before any session has happened', async () => {
    const engine = new MockGoalTrackingEngine()
    const insight = await engine.track(makeMentorActivitySnapshot({ sessionCount: 0 }))
    expect(insight.summary).toBe('Ready to set a goal')
  })

  it('reflects the real session count in the detail', async () => {
    const engine = new MockGoalTrackingEngine()
    const insight = await engine.track(makeMentorActivitySnapshot({ sessionCount: 7 }))
    expect(insight.detail).toContain('7 sessions')
  })
})
