import { describe, it, expect } from 'vitest'
import { computeGoalProgress } from './goalProgressEngine'
import { computeReadingProfile } from './readingProfileEngine'
import { buildSession } from './testFixtures'

describe('computeGoalProgress', () => {
  it('returns 0 for a goal with no session data', () => {
    const profile = computeReadingProfile([])
    expect(computeGoalProgress('faster-reading', profile, [])).toBe(0)
  })

  it('computes faster-reading progress toward 300 WPM', () => {
    const sessions = [buildSession({ wpm: 150 })]
    const profile = computeReadingProfile(sessions)
    expect(computeGoalProgress('faster-reading', profile, sessions)).toBe(50)
  })

  it('caps progress at 100 even when exceeding the target', () => {
    const sessions = [buildSession({ wpm: 600 })]
    const profile = computeReadingProfile(sessions)
    expect(computeGoalProgress('faster-reading', profile, sessions)).toBe(100)
  })

  it('computes academic-excellence as an average of accuracy and comprehension progress', () => {
    const sessions = [buildSession({ accuracyPercent: 90, comprehensionPercent: 45 })]
    const profile = computeReadingProfile(sessions)
    // accuracy 90/90=100%, comprehension 45/90=50% -> average 75%
    expect(computeGoalProgress('academic-excellence', profile, sessions)).toBe(75)
  })

  it('weighs professional-reading toward business/technology category share', () => {
    const sessions = [
      buildSession({ category: 'business', accuracyPercent: 85 }),
      buildSession({ category: 'science', accuracyPercent: 85 }),
    ]
    const profile = computeReadingProfile(sessions)
    const progress = computeGoalProgress('professional-reading', profile, sessions)
    expect(progress).toBeGreaterThan(0)
    expect(progress).toBeLessThanOrEqual(100)
  })

  it('returns 0 for an unknown goal id', () => {
    const sessions = [buildSession()]
    const profile = computeReadingProfile(sessions)
    // @ts-expect-error — deliberately testing an invalid goal id
    expect(computeGoalProgress('not-a-real-goal', profile, sessions)).toBe(0)
  })
})
