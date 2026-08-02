import { describe, expect, it } from 'vitest'
import { makeReadingIntelligenceJourney } from '../testFixtures'
import { buildReadingNextRecommendation } from './buildReadingNextRecommendation'

describe('buildReadingNextRecommendation', () => {
  it('Next Recommended Exercise: reshapes journey.nextRecommendationLabel/Href without recomputing them', () => {
    const journey = makeReadingIntelligenceJourney({
      nextRecommendationLabel: 'Open Flash Intelligence Pack™',
      nextRecommendationHref: '/labs/quantum-speed-reading/word-flash',
      welcomeTitle: 'Reading Preparation™',
    })

    expect(buildReadingNextRecommendation(journey)).toEqual({
      label: 'Open Flash Intelligence Pack™',
      href: '/labs/quantum-speed-reading/word-flash',
      stageTitle: 'Reading Preparation™',
    })
  })

  it('Determinism: identical inputs produce identical output', () => {
    const journey = makeReadingIntelligenceJourney()
    expect(buildReadingNextRecommendation(journey)).toEqual(buildReadingNextRecommendation(journey))
  })
})
