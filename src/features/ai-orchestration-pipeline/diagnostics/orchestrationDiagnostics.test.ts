import { describe, expect, it } from 'vitest'
import { generateAIOrchestrationDiagnostics } from './generateAIOrchestrationDiagnostics'
import { makeAIOrchestrationResult } from '../testFixtures'

describe('generateAIOrchestrationDiagnostics', () => {
  it('reports the pipeline stage, completion status, validation status, timeline, and version', () => {
    const result = makeAIOrchestrationResult({ version: 3 })
    const diagnostics = generateAIOrchestrationDiagnostics(result, { valid: true, issues: [] })
    expect(diagnostics).toEqual({
      pipelineStage: result.context.stage,
      completionStatus: result.completionStatus,
      validationStatus: 'valid',
      executionTimeline: result.context.completedStages,
      pipelineVersion: 3,
    })
  })

  it('reports validationStatus: invalid when the validation result is invalid', () => {
    const diagnostics = generateAIOrchestrationDiagnostics(makeAIOrchestrationResult(), { valid: false, issues: [] })
    expect(diagnostics.validationStatus).toBe('invalid')
  })
})
