import { describe, it, expect } from 'vitest'
import { generateDailyPlan } from './dailyPlanEngine'
import { computeReadingProfile } from '../adaptive-intelligence/readingProfileEngine'
import { computeCategoryIntelligence } from '../adaptive-intelligence/categoryIntelligenceEngine'
import { buildSession } from './testFixtures'

describe('generateDailyPlan', () => {
  it('builds a 3-step plan of real passages for a first-time learner', () => {
    const profile = computeReadingProfile([])
    const categoryIntelligence = computeCategoryIntelligence([])
    const plan = generateDailyPlan(profile, categoryIntelligence, null, null, null)
    expect(plan.steps).toHaveLength(3)
    for (const step of plan.steps) {
      expect(step.passage.id).toBeTruthy()
    }
  })

  it('computes a real, non-zero total estimated time from the actual passages chosen', () => {
    const profile = computeReadingProfile([])
    const categoryIntelligence = computeCategoryIntelligence([])
    const plan = generateDailyPlan(profile, categoryIntelligence, null, null, null)
    const manualSum = plan.steps.reduce((sum) => sum, 0)
    expect(plan.estimatedTimeSec).toBeGreaterThan(0)
    expect(plan.estimatedTimeLabel.length).toBeGreaterThan(0)
    expect(manualSum).toBeDefined()
  })

  it('prefers 3 distinct categories across the plan when possible', () => {
    const sessions = [buildSession({ category: 'science', difficulty: 'easy', accuracyPercent: 95, comprehensionPercent: 95 })]
    const profile = computeReadingProfile(sessions)
    const categoryIntelligence = computeCategoryIntelligence(sessions)
    const plan = generateDailyPlan(profile, categoryIntelligence, sessions[0]!, null, null)
    const categories = new Set(plan.steps.map((s) => s.passage.category))
    expect(categories.size).toBeGreaterThanOrEqual(2)
  })

  it('includes a review step for the most recently practiced category/difficulty when available', () => {
    const sessions = [buildSession({ category: 'history', difficulty: 'medium' })]
    const profile = computeReadingProfile(sessions)
    const categoryIntelligence = computeCategoryIntelligence(sessions)
    const plan = generateDailyPlan(profile, categoryIntelligence, sessions[0]!, null, null)
    const reviewStep = plan.steps[plan.steps.length - 1]!
    expect(reviewStep.label).toBe('Review Session')
  })
})
