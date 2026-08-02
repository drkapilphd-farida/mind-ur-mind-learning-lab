import { describe, expect, it } from 'vitest'
import { createExecutionOrchestrationService } from './DefaultExecutionOrchestrationService'
import { makeExecutionPlannerInputs, makeFixedClock, makeSequentialIdGenerator, makeStrategyResult } from '../testFixtures'

const NOW = '2026-06-01T00:00:00.000Z'

describe('DefaultExecutionOrchestrationService', () => {
  it('generate() produces a plan, a valid validation result, and diagnostics together', () => {
    const service = createExecutionOrchestrationService({ clock: makeFixedClock(NOW), idGenerator: makeSequentialIdGenerator('plan') })
    const inputs = makeExecutionPlannerInputs({ strategyResults: [makeStrategyResult({ type: 'difficulty', value: 'advanced' })] })

    const result = service.generate(inputs)

    expect(result.plan.id).toBe('plan-1')
    expect(result.plan.metadata.generatedAt).toBe(NOW)
    expect(result.validationResult).toEqual({ valid: true, issues: [] })
    expect(result.diagnostics.validationStatus).toBe('valid')
    expect(result.diagnostics.totalSteps).toBe(result.plan.sequences.reduce((total, sequence) => total + sequence.steps.length, 0))
  })

  it('reports an invalid validation result and matching diagnostics for an empty plan', () => {
    const service = createExecutionOrchestrationService()
    const inputs = makeExecutionPlannerInputs({
      strategyResults: [],
      adaptivePlanFacts: { journey: null, exerciseIds: [], difficultyLevel: null, sessionDurationMinutes: null, milestoneIds: [] },
    })

    const result = service.generate(inputs)

    expect(result.validationResult.valid).toBe(false)
    expect(result.validationResult.issues.some((issue) => issue.type === 'empty-plan')).toBe(true)
    expect(result.diagnostics.validationStatus).toBe('invalid')
    expect(result.diagnostics.totalSteps).toBe(0)
  })

  it('uses default dependencies when no overrides are given', () => {
    const service = createExecutionOrchestrationService()
    const result = service.generate(makeExecutionPlannerInputs())
    expect(result.plan.id).toBeTruthy()
    expect(result.plan.metadata.generatedAt).toBeTruthy()
  })
})
