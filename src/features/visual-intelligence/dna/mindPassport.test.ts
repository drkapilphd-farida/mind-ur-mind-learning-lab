import { describe, expect, it } from 'vitest'
import { buildMindPassportSnapshot } from './mindPassport'

describe('buildMindPassportSnapshot', () => {
  it('maps identity, score, and level fields into the exact 7-field passport shape', () => {
    const snapshot = buildMindPassportSnapshot({
      visualDnaLevel: 'Explorer',
      visualIntelligenceScore: 420,
      identity: { observationStyle: 'Calm Observer', focusStyle: 'Momentum Builder', visualProcessingStyle: 'Balanced Processor', peripheralStyle: 'Expanding Vision' },
      growthPercent: 12,
      achievementCount: 2,
      latestAiSummary: 'Real summary text.',
    })

    expect(snapshot).toEqual({
      visualDnaLevel: 'Explorer',
      visualIntelligenceScore: 420,
      primaryTrait: 'Calm Observer',
      observationStyle: 'Calm Observer',
      growthPercent: 12,
      achievementCount: 2,
      latestAiSummary: 'Real summary text.',
    })
  })
})
