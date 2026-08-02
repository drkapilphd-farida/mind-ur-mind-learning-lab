import { describe, expect, it } from 'vitest'
import { deriveAiLearningProfile } from './deriveAiLearningProfile'

describe('deriveAiLearningProfile', () => {
  it('is honestly empty when no real sessions exist for any stage', () => {
    const profile = deriveAiLearningProfile(null, [], [], [])
    expect(profile.reading).toEqual({ completed: false, lastCompletedAt: null, sessionCount: 0 })
    expect(profile.hasEnoughDataForFullProfile).toBe(false)
    expect(profile.recommendedNextStep).toBe('Complete Reading Discovery to begin your AI Learning Profile.')
  })

  it('reports a real completed stage from a real completed row', () => {
    const profile = deriveAiLearningProfile(null, [{ completed: true, occurred_at: '2026-07-20T10:00:00.000Z' }], [], [])
    expect(profile.reading).toEqual({ completed: true, lastCompletedAt: '2026-07-20T10:00:00.000Z', sessionCount: 1 })
    expect(profile.recommendedNextStep).toBe('Complete Memory Discovery next.')
  })

  it('counts every real session, not only completed ones', () => {
    const profile = deriveAiLearningProfile(null, [{ completed: false, occurred_at: '2026-07-20T10:00:00.000Z' }], [], [])
    expect(profile.reading.sessionCount).toBe(1)
    expect(profile.reading.completed).toBe(false)
  })

  it('reports hasEnoughDataForFullProfile only once every real stage has a completed session', () => {
    const completedRow = [{ completed: true, occurred_at: '2026-07-20T10:00:00.000Z' }]
    const profile = deriveAiLearningProfile('myself', completedRow, completedRow, completedRow)
    expect(profile.hasEnoughDataForFullProfile).toBe(true)
    expect(profile.recommendedNextStep).toBe('Your AI Learning Profile is ready — start your personalized AI Learning Studio journey.')
    expect(profile.learnerType).toBe('myself')
  })
})
