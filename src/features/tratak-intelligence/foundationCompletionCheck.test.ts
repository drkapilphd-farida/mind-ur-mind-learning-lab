import { describe, expect, it } from 'vitest'
import { isFoundationJourneyComplete } from './foundationCompletionCheck'

describe('isFoundationJourneyComplete', () => {
  it('is false when nothing has been completed', () => {
    expect(isFoundationJourneyComplete({ visualPreparationCount: 0, fixationCount: 0, persistenceChallengeCount: 0 })).toBe(false)
  })

  it('is false when only some of the 3 dimensions have a completion', () => {
    expect(isFoundationJourneyComplete({ visualPreparationCount: 1, fixationCount: 1, persistenceChallengeCount: 0 })).toBe(false)
  })

  it('is true only once all 3 dimensions have at least one completion', () => {
    expect(isFoundationJourneyComplete({ visualPreparationCount: 1, fixationCount: 2, persistenceChallengeCount: 3 })).toBe(true)
  })
})
