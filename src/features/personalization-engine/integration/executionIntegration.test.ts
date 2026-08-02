import { describe, expect, it } from 'vitest'
import { buildAdaptivePlanFacts } from './buildAdaptivePlanFacts'
import { buildExecutionPlannerInputs } from './buildExecutionPlannerInputs'
import { makeAdaptiveLearningPlan, makeContextPackage, makeMemoryConfiguration, makeStrategyResult } from '../testFixtures'

describe('buildAdaptivePlanFacts', () => {
  it('returns empty facts for a null adaptive plan', () => {
    expect(buildAdaptivePlanFacts(null)).toEqual({ journey: null, exerciseIds: [], difficultyLevel: null, sessionDurationMinutes: null, milestoneIds: [] })
  })

  it('reduces an AdaptiveLearningPlan down to flat execution facts', () => {
    const adaptivePlan = makeAdaptiveLearningPlan({
      recommendedJourney: 'quantum-speed-reading',
      recommendedExercises: [{ skill: 'reading', exerciseId: 'ex-1', priority: 1 }],
      dailyDurationMinutes: 20,
      difficultyLevel: 'intermediate',
      learningMilestones: [{ id: 'milestone-1', description: 'x', targetProgressPercent: 50 }],
    })

    expect(buildAdaptivePlanFacts(adaptivePlan)).toEqual({
      journey: 'quantum-speed-reading',
      exerciseIds: ['ex-1'],
      difficultyLevel: 'intermediate',
      sessionDurationMinutes: 20,
      milestoneIds: ['milestone-1'],
    })
  })
})

describe('buildExecutionPlannerInputs', () => {
  it('composes decisions, strategy results, and reduced facts into ExecutionPlannerInputs', () => {
    const inputs = buildExecutionPlannerInputs({
      profileId: 'profile-1',
      learnerId: 'learner-1',
      decisions: [],
      strategyResults: [makeStrategyResult()],
      adaptivePlan: makeAdaptiveLearningPlan({ recommendedJourney: 'journey-a' }),
      memoryContext: makeContextPackage(),
      configuration: makeMemoryConfiguration({ entries: [{ key: 'maxStepsPerSession', value: 3 }] }),
    })

    expect(inputs.profileId).toBe('profile-1')
    expect(inputs.strategyResults).toHaveLength(1)
    expect(inputs.adaptivePlanFacts.journey).toBe('journey-a')
    expect(inputs.memoryFacts.sectionCount).toBe(1)
    expect(inputs.configurationFacts).toEqual({ maxStepsPerSession: 3 })
  })

  it('handles null adaptivePlan/memoryContext/configuration inputs', () => {
    const inputs = buildExecutionPlannerInputs({
      profileId: 'profile-1',
      learnerId: 'learner-1',
      decisions: [],
      strategyResults: [],
      adaptivePlan: null,
      memoryContext: null,
      configuration: null,
    })

    expect(inputs.adaptivePlanFacts).toEqual({ journey: null, exerciseIds: [], difficultyLevel: null, sessionDurationMinutes: null, milestoneIds: [] })
    expect(inputs.memoryFacts).toEqual({})
    expect(inputs.configurationFacts).toEqual({})
  })
})
