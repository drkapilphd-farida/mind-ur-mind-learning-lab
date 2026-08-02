import { describe, it, expect } from 'vitest'
import { recommendNextSession } from './nextSessionRecommendationEngine'
import { computeReadingProfile } from '../adaptive-intelligence/readingProfileEngine'
import { computeCategoryIntelligence } from '../adaptive-intelligence/categoryIntelligenceEngine'
import { buildSession } from './testFixtures'

describe('recommendNextSession', () => {
  it('recommends a real passage for a first-time learner with no history', () => {
    const profile = computeReadingProfile([])
    const categoryIntelligence = computeCategoryIntelligence([])
    const rec = recommendNextSession(profile, categoryIntelligence, null, null, null)
    expect(rec).not.toBeNull()
    expect(rec?.passage.category).toBe(rec?.category)
    expect(rec?.passage.difficulty).toBe(rec?.difficulty)
  })

  it('recommends a never-practiced category over repeating the same one', () => {
    const sessions = [buildSession({ category: 'science', accuracyPercent: 95 })]
    const profile = computeReadingProfile(sessions)
    const categoryIntelligence = computeCategoryIntelligence(sessions)
    const rec = recommendNextSession(profile, categoryIntelligence, sessions[0]!, null, null)
    expect(rec?.category).not.toBe('science')
  })

  it('always resolves to a passage that actually exists in the library', () => {
    const sessions = [buildSession({ category: 'history', difficulty: 'hard', accuracyPercent: 95, comprehensionPercent: 95 })]
    const profile = computeReadingProfile(sessions)
    const categoryIntelligence = computeCategoryIntelligence(sessions)
    const rec = recommendNextSession(profile, categoryIntelligence, sessions[0]!, null, null)
    expect(rec?.passage.id).toBeTruthy()
  })

  it('mentions the goal in the reason when a goal is selected', () => {
    const profile = computeReadingProfile([])
    const categoryIntelligence = computeCategoryIntelligence([])
    const rec = recommendNextSession(profile, categoryIntelligence, null, null, 'faster-reading')
    expect(rec?.reason).toContain('Faster Reading')
  })
})
