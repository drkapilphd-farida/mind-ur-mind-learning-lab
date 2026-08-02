import { describe, expect, it } from 'vitest'
import { makeJourneyProgress, makeJourneyStageView } from '../testFixtures'
import { buildReadingDailyMission } from './buildReadingDailyMission'

describe('buildReadingDailyMission', () => {
  it('Daily Mission: derives from the current stage when one exists', () => {
    const journey = makeJourneyProgress({
      stages: [
        makeJourneyStageView({ id: 'stage-a', status: 'complete' }),
        makeJourneyStageView({ id: 'stage-b', status: 'current', title: 'Flash Intelligence Pack™', href: '/labs/quantum-speed-reading/word-flash', actionLabel: 'Continue: Word Flash' }),
      ],
      isJourneyComplete: false,
    })

    const mission = buildReadingDailyMission(journey)

    expect(mission).toEqual({
      stageId: 'stage-b',
      stageTitle: 'Flash Intelligence Pack™',
      actionLabel: 'Continue: Word Flash',
      continueHref: '/labs/quantum-speed-reading/word-flash',
      isAllDone: false,
    })
  })

  it('Daily Mission: falls back to the last stage and journey-level fields when every stage is complete', () => {
    const journey = makeJourneyProgress({
      stages: [makeJourneyStageView({ id: 'stage-a', status: 'complete' })],
      isJourneyComplete: true,
      continueHref: '/labs/quantum-speed-reading/intelligence',
      continueLabel: 'Open Reading Intelligence™',
    })

    const mission = buildReadingDailyMission(journey)

    expect(mission).toEqual({
      stageId: 'stage-a',
      stageTitle: 'Core Reading Journey™',
      actionLabel: 'Open Reading Intelligence™',
      continueHref: '/labs/quantum-speed-reading/intelligence',
      isAllDone: true,
    })
  })

  it('Determinism: identical inputs produce identical output', () => {
    const journey = makeJourneyProgress()

    expect(buildReadingDailyMission(journey)).toEqual(buildReadingDailyMission(journey))
  })
})
