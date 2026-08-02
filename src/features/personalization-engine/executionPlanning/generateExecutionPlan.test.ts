import { describe, expect, it } from 'vitest'
import { generateExecutionPlan } from './generateExecutionPlan'
import { makeExecutionPlannerInputs, makeStrategyResult } from '../testFixtures'

const NOW = '2026-06-01T00:00:00.000Z'

describe('generateExecutionPlan', () => {
  it('produces a plan with one sequence per non-empty sequencing concern', () => {
    const inputs = makeExecutionPlannerInputs({
      strategyResults: [makeStrategyResult({ type: 'difficulty', value: 'advanced' })],
    })
    const plan = generateExecutionPlan(inputs, NOW, 'plan-1')

    expect(plan.id).toBe('plan-1')
    expect(plan.version).toBe(1)
    expect(plan.metadata).toEqual({ learnerId: inputs.learnerId, profileId: inputs.profileId, source: 'execution-planner', generatedAt: NOW })
    expect(plan.sequences.map((sequence) => sequence.type)).toEqual(['journey', 'exercise', 'difficulty'])
  })

  it('omits sequences that produced no steps', () => {
    const inputs = makeExecutionPlannerInputs({
      adaptivePlanFacts: { journey: null, exerciseIds: [], difficultyLevel: null, sessionDurationMinutes: null, milestoneIds: [] },
      strategyResults: [],
    })
    const plan = generateExecutionPlan(inputs, NOW, 'plan-1')
    expect(plan.sequences).toEqual([])
  })

  it('is deterministic — identical inputs produce an identical plan', () => {
    const inputs = makeExecutionPlannerInputs()
    expect(generateExecutionPlan(inputs, NOW, 'plan-1')).toEqual(generateExecutionPlan(inputs, NOW, 'plan-1'))
  })
})
