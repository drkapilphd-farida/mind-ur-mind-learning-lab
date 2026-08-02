import { describe, expect, it } from 'vitest'
import { makeReadingIntelligenceExperienceResult } from '../testFixtures'
import { buildReadingSessionStatus } from './buildReadingSessionStatus'

describe('buildReadingSessionStatus', () => {
  it('Session Status: derives stage label and position from the current stage', () => {
    const status = buildReadingSessionStatus(makeReadingIntelligenceExperienceResult())

    expect(status).toEqual({
      stageLabel: 'Core Reading Journey™',
      stagePosition: { index: 2, total: 3 },
      exerciseLabel: 'Continue: Progressive Chunk Reading',
      isComplete: false,
    })
  })

  it('Session Status: exerciseLabel is null once the daily mission is all done', () => {
    const experience = makeReadingIntelligenceExperienceResult({
      dailyMission: {
        stageId: 'reading-intelligence',
        stageTitle: 'Reading Intelligence™',
        actionLabel: 'Open',
        continueHref: '/labs/quantum-speed-reading/intelligence',
        isAllDone: true,
      },
    })

    expect(buildReadingSessionStatus(experience).exerciseLabel).toBeNull()
  })

  it('Determinism: identical inputs produce identical output', () => {
    const experience = makeReadingIntelligenceExperienceResult()
    expect(buildReadingSessionStatus(experience)).toEqual(buildReadingSessionStatus(experience))
  })
})
