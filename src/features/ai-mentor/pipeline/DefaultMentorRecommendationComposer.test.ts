import { describe, expect, it, vi } from 'vitest'
import { createMentorRecommendationComposer } from './DefaultMentorRecommendationComposer'
import { makeMentorActivitySnapshot, makeMentorRecommendation } from '../testFixtures'

describe('createMentorRecommendationComposer', () => {
  it('sorts recommendations by priority: high, then medium, then low', async () => {
    const recommendationEngine = {
      recommend: vi.fn().mockResolvedValue([
        makeMentorRecommendation({ id: 'r-low', priority: 'low' }),
        makeMentorRecommendation({ id: 'r-high', priority: 'high' }),
        makeMentorRecommendation({ id: 'r-medium', priority: 'medium' }),
      ]),
    }

    const composer = createMentorRecommendationComposer({ recommendationEngine })
    const recommendations = await composer.compose(makeMentorActivitySnapshot(), [])

    expect(recommendations.map((r) => r.id)).toEqual(['r-high', 'r-medium', 'r-low'])
  })

  it('delegates to the injected RecommendationEngine with the real snapshot and insights', async () => {
    const snapshot = makeMentorActivitySnapshot()
    const insights = [{ id: 'i1', type: 'weakness' as const, summary: 's', detail: 'd' }]
    const recommendationEngine = { recommend: vi.fn().mockResolvedValue([]) }

    const composer = createMentorRecommendationComposer({ recommendationEngine })
    await composer.compose(snapshot, insights)

    expect(recommendationEngine.recommend).toHaveBeenCalledExactlyOnceWith(snapshot, insights)
  })

  it('works end to end with the real RecommendationEngine default', async () => {
    const composer = createMentorRecommendationComposer()
    const recommendations = await composer.compose(makeMentorActivitySnapshot({ sessionCount: 0 }), [])
    expect(recommendations.length).toBeGreaterThan(0)
  })
})
