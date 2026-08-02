import { describe, expect, it } from 'vitest'
import { validateExecutionPlan } from './validateExecutionPlan'
import { makeExecutionSequence, makeExecutionStep, makePersonalizationExecutionPlan } from '../testFixtures'

describe('validateExecutionPlan', () => {
  it('reports valid: true for a well-formed plan', () => {
    const plan = makePersonalizationExecutionPlan()
    expect(validateExecutionPlan(plan, {})).toEqual({ valid: true, issues: [] })
  })

  it('detects an empty-plan when there are no steps at all', () => {
    const plan = makePersonalizationExecutionPlan({ sequences: [] })
    const result = validateExecutionPlan(plan, {})
    expect(result.valid).toBe(false)
    expect(result.issues).toEqual([{ type: 'empty-plan', stepId: null, detail: expect.any(String) }])
  })

  it('detects an invalid-reference', () => {
    const step = makeExecutionStep({ referenceId: '' })
    const plan = makePersonalizationExecutionPlan({ sequences: [makeExecutionSequence({ steps: [step] })] })
    const result = validateExecutionPlan(plan, {})
    expect(result.issues.some((issue) => issue.type === 'invalid-reference')).toBe(true)
  })

  it('detects a duplicate-step across sequences', () => {
    const stepA = makeExecutionStep({ id: 'step-1', order: 0 })
    const stepB = makeExecutionStep({ id: 'step-1', order: 0, sequenceType: 'review' })
    const plan = makePersonalizationExecutionPlan({
      sequences: [makeExecutionSequence({ type: 'exercise', steps: [stepA] }), makeExecutionSequence({ type: 'review', steps: [stepB] })],
    })
    const result = validateExecutionPlan(plan, {})
    expect(result.issues.some((issue) => issue.type === 'duplicate-step')).toBe(true)
  })

  it('detects an ordering-violation', () => {
    const step = makeExecutionStep({ order: 5 })
    const plan = makePersonalizationExecutionPlan({ sequences: [makeExecutionSequence({ steps: [step] })] })
    const result = validateExecutionPlan(plan, {})
    expect(result.issues.some((issue) => issue.type === 'ordering-violation')).toBe(true)
  })

  it('detects a configuration-violation when the session sequence exceeds maxStepsPerSession', () => {
    const steps = [makeExecutionStep({ id: 'a', order: 0 }), makeExecutionStep({ id: 'b', order: 1 })]
    const plan = makePersonalizationExecutionPlan({ sequences: [makeExecutionSequence({ type: 'session', steps })] })
    const result = validateExecutionPlan(plan, { maxStepsPerSession: 1 })
    expect(result.issues.some((issue) => issue.type === 'configuration-violation')).toBe(true)
  })

  it('does not flag configuration compliance when no maxStepsPerSession fact is configured', () => {
    const steps = [makeExecutionStep({ id: 'a', order: 0 }), makeExecutionStep({ id: 'b', order: 1 })]
    const plan = makePersonalizationExecutionPlan({ sequences: [makeExecutionSequence({ type: 'session', steps })] })
    expect(validateExecutionPlan(plan, {}).valid).toBe(true)
  })
})
