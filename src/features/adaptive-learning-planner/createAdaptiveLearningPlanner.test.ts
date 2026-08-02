import { describe, expect, it, vi } from 'vitest'
import { createAdaptiveLearningPlanner } from './createAdaptiveLearningPlanner'
import { makeLearnerProfile } from './testFixtures'
import type { LearningGoalAnalyzer } from './contracts'

describe('createAdaptiveLearningPlanner (end-to-end, real default engines)', () => {
  it('generates a complete AdaptiveLearningPlan from a LearnerProfile', () => {
    const planner = createAdaptiveLearningPlanner()
    const plan = planner.generatePlan(makeLearnerProfile({ learningGoal: 'I want to read faster', readingLevel: 'beginner' }))

    expect(plan.suggestedMentorFocus).toBe('reading')
    expect(plan.recommendedJourney).toBe('quantum-speed-reading')
    expect(plan.recommendedExercises.length).toBeGreaterThan(0)
    expect(plan.dailyDurationMinutes).toBe(30)
    expect(plan.weeklySchedule.days).toHaveLength(7)
    expect(plan.prioritySkills.length).toBe(3)
    expect(plan.learningMilestones.length).toBeGreaterThan(0)
  })

  it('falls back to the top-priority skill gap for mentor focus when the goal is general', () => {
    const planner = createAdaptiveLearningPlanner()
    const plan = planner.generatePlan(
      makeLearnerProfile({ learningGoal: 'I want to improve overall', readingLevel: 'beginner', memoryLevel: 'expert', focusLevel: 'expert' }),
    )

    expect(plan.suggestedMentorFocus).toBe('reading')
  })

  it('is deterministic end-to-end — the same profile always produces the same plan', () => {
    const planner = createAdaptiveLearningPlanner()
    const profile = makeLearnerProfile()
    expect(planner.generatePlan(profile)).toEqual(planner.generatePlan(profile))
  })

  it('is fully dependency-injected — an overridden engine is actually used', () => {
    const analyzeSpy = vi.fn(() => ({ rawGoal: 'stub', focusSkill: 'memory' as const }))
    const stubGoalAnalyzer: LearningGoalAnalyzer = { analyze: analyzeSpy }

    const planner = createAdaptiveLearningPlanner({ goalAnalyzer: stubGoalAnalyzer })
    const plan = planner.generatePlan(makeLearnerProfile())

    expect(analyzeSpy).toHaveBeenCalledTimes(1)
    expect(plan.suggestedMentorFocus).toBe('memory')
  })

  it('never fabricates a score — dailyDurationMinutes always traces back to availableMinutesPerDay', () => {
    const planner = createAdaptiveLearningPlanner()
    const plan = planner.generatePlan(makeLearnerProfile({ availableMinutesPerDay: 15 }))
    expect(plan.dailyDurationMinutes).toBe(15)
  })
})
