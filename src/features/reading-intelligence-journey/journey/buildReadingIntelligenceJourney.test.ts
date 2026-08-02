import { describe, expect, it } from 'vitest'
import { makeReadingExerciseQueue, makeReadingIntelligenceExperienceResult } from '../testFixtures'
import { buildReadingIntelligenceJourney } from './buildReadingIntelligenceJourney'

describe('buildReadingIntelligenceJourney', () => {
  it('Welcome / Continue Learning / Streak / Mind Score / XP: every field is sourced directly, never recomputed', () => {
    const experience = makeReadingIntelligenceExperienceResult()
    const queue = makeReadingExerciseQueue()

    const journey = buildReadingIntelligenceJourney(experience, queue)

    expect(journey.welcomeTitle).toBe(experience.dailyMission.stageTitle)
    expect(journey.missionLabel).toBe(experience.journeyState.journey.todaysMissionLabel)
    expect(journey.continueHref).toBe(experience.dailyMission.continueHref)
    expect(journey.continueLabel).toBe(experience.dailyMission.actionLabel)
    expect(journey.queue).toBe(queue)
    expect(journey.progress).toBe(experience.progressSnapshot)
    expect(journey.streak).toBe(experience.journeyState.streak)
    expect(journey.mindScore).toBe(experience.journeyState.mindScore)
    expect(journey.mindScoreLabel).toBe(experience.journeyState.mindScoreLabel)
    expect(journey.xp).toBe(experience.xp)
  })

  it('Next Recommendation: points at the stage after the current one when it exists', () => {
    const experience = makeReadingIntelligenceExperienceResult()
    const journey = buildReadingIntelligenceJourney(experience, makeReadingExerciseQueue())

    expect(journey.nextRecommendationLabel).toBe('Open Reading Intelligence™')
    expect(journey.nextRecommendationHref).toBe('/labs/quantum-speed-reading/intelligence')
  })

  it('Next Recommendation: falls back to the continue target when already on the last stage', () => {
    const experience = makeReadingIntelligenceExperienceResult({
      dailyMission: {
        stageId: 'reading-intelligence',
        stageTitle: 'Reading Intelligence™',
        actionLabel: 'Open',
        continueHref: '/labs/quantum-speed-reading/intelligence',
        isAllDone: false,
      },
    })

    const journey = buildReadingIntelligenceJourney(experience, makeReadingExerciseQueue())

    expect(journey.nextRecommendationLabel).toBe('Open')
    expect(journey.nextRecommendationHref).toBe('/labs/quantum-speed-reading/intelligence')
  })

  it('Determinism: identical inputs produce identical output', () => {
    const experience = makeReadingIntelligenceExperienceResult()
    const queue = makeReadingExerciseQueue()

    expect(buildReadingIntelligenceJourney(experience, queue)).toEqual(
      buildReadingIntelligenceJourney(experience, queue),
    )
  })
})
