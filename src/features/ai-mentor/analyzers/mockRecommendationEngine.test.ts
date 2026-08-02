import { describe, expect, it } from 'vitest'
import { MockRecommendationEngine } from './mockRecommendationEngine'
import { makeMentorActivitySnapshot } from '../testFixtures'
import type { MentorInsight } from '../types'

describe('MockRecommendationEngine', () => {
  it('turns every weakness insight into a practice recommendation, reusing its real detail text', async () => {
    const engine = new MockRecommendationEngine()
    const weakness: MentorInsight = { id: 'weakness-1', type: 'weakness', summary: 'Limited active recall practice', detail: 'Some real detail text.' }

    const recommendations = await engine.recommend(makeMentorActivitySnapshot(), [weakness])

    const practiceRecommendation = recommendations.find((r) => r.category === 'practice')
    expect(practiceRecommendation).toBeDefined()
    expect(practiceRecommendation?.description).toBe('Some real detail text.')
  })

  it('ignores non-weakness insights when building practice recommendations', async () => {
    const engine = new MockRecommendationEngine()
    const strength: MentorInsight = { id: 'strength-1', type: 'strength', summary: 'Consistent', detail: 'detail' }

    const recommendations = await engine.recommend(makeMentorActivitySnapshot(), [strength])

    expect(recommendations.some((r) => r.category === 'practice')).toBe(false)
  })

  it('recommends starting the first session when sessionCount is zero', async () => {
    const engine = new MockRecommendationEngine()
    const recommendations = await engine.recommend(makeMentorActivitySnapshot({ sessionCount: 0 }), [])
    const nextStep = recommendations.find((r) => r.category === 'next-step')
    expect(nextStep).toMatchObject({ priority: 'high', title: 'Start your first study session' })
  })

  it('recommends continuing when sessionCount is greater than zero', async () => {
    const engine = new MockRecommendationEngine()
    const recommendations = await engine.recommend(makeMentorActivitySnapshot({ sessionCount: 2 }), [])
    const nextStep = recommendations.find((r) => r.category === 'next-step')
    expect(nextStep).toMatchObject({ priority: 'medium', title: 'Continue where you left off' })
  })

  it('always includes exactly one next-step recommendation', async () => {
    const engine = new MockRecommendationEngine()
    const recommendations = await engine.recommend(makeMentorActivitySnapshot(), [])
    expect(recommendations.filter((r) => r.category === 'next-step')).toHaveLength(1)
  })
})
