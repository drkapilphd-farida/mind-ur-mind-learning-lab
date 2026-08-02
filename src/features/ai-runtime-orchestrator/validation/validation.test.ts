import { describe, expect, it } from 'vitest'
import { validateRuntimeOrchestrationInputs } from './validateRuntimeOrchestrationInputs'
import { validateFinalRuntimeResult } from './validateFinalRuntimeResult'
import { makeAIRuntimeResult, makeRuntimeOrchestrationInputs } from '../testFixtures'

describe('validateRuntimeOrchestrationInputs (Missing execution context)', () => {
  it('reports valid: true for well-formed inputs', () => {
    expect(validateRuntimeOrchestrationInputs(makeRuntimeOrchestrationInputs())).toEqual({ valid: true, issues: [] })
  })

  it('detects missing-execution-context for a blank learnerId', () => {
    const result = validateRuntimeOrchestrationInputs(makeRuntimeOrchestrationInputs({ learnerId: '' }))
    expect(result.issues.some((issue) => issue.type === 'missing-execution-context')).toBe(true)
  })

  it('detects missing-execution-context for a blank profileId', () => {
    const result = validateRuntimeOrchestrationInputs(makeRuntimeOrchestrationInputs({ profileId: '' }))
    expect(result.issues.some((issue) => issue.type === 'missing-execution-context')).toBe(true)
  })
})

describe('validateFinalRuntimeResult (Invalid runtime state / Invalid final result)', () => {
  it('reports valid: true for a well-formed completed result', () => {
    expect(validateFinalRuntimeResult(makeAIRuntimeResult())).toEqual({ valid: true, issues: [] })
  })

  it('reports valid: true for a well-formed failed result', () => {
    const result = makeAIRuntimeResult({ state: 'failed', completionStatus: 'failed', success: null, failureReason: 'missing-provider' })
    expect(validateFinalRuntimeResult(result)).toEqual({ valid: true, issues: [] })
  })

  it('detects invalid-final-result when completed carries a failureReason', () => {
    const result = makeAIRuntimeResult({ failureReason: 'oops' })
    const validation = validateFinalRuntimeResult(result)
    expect(validation.issues.some((issue) => issue.type === 'invalid-final-result')).toBe(true)
  })

  it('detects invalid-final-result when failed carries a success', () => {
    const result = makeAIRuntimeResult({ state: 'failed', completionStatus: 'failed', failureReason: 'oops' })
    const validation = validateFinalRuntimeResult(result)
    expect(validation.issues.some((issue) => issue.type === 'invalid-final-result')).toBe(true)
  })

  it('detects invalid-runtime-state when state and completionStatus disagree', () => {
    const result = makeAIRuntimeResult({ state: 'request-ready' })
    const validation = validateFinalRuntimeResult(result)
    expect(validation.issues.some((issue) => issue.type === 'invalid-runtime-state')).toBe(true)
  })
})
