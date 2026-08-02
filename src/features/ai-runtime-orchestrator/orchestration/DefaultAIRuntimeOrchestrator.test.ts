import { describe, expect, it } from 'vitest'
import type { RuntimeCoordinator } from '../coordination'
import { createAIRuntimeOrchestrator } from './DefaultAIRuntimeOrchestrator'
import { makeAIRuntimeResult, makeRuntimeOrchestrationInputs } from '../testFixtures'

describe('DefaultAIRuntimeOrchestrator', () => {
  it('End-to-End Orchestration: a well-formed run completes successfully', () => {
    const orchestrator = createAIRuntimeOrchestrator()

    const result = orchestrator.run(makeRuntimeOrchestrationInputs())

    expect(result.completionStatus).toBe('completed')
    expect(result.success).not.toBeNull()
  })

  it('Runtime Integrity / Diagnostics: the returned diagnostics reflect the real selection and completed stages', () => {
    const orchestrator = createAIRuntimeOrchestrator()

    const result = orchestrator.run(makeRuntimeOrchestrationInputs())

    expect(result.diagnostics.selectedProviderId).not.toBeNull()
    expect(result.diagnostics.selectedModelId).not.toBeNull()
    expect(result.diagnostics.completedStages[0]).toBe('pending')
    expect(result.diagnostics.completedStages.at(-1)).toBe('completed')
  })

  it('Error Scenarios: a blank learnerId is rejected before any stage runs', () => {
    const orchestrator = createAIRuntimeOrchestrator()

    const result = orchestrator.run(makeRuntimeOrchestrationInputs({ learnerId: '' }))

    expect(result.completionStatus).toBe('failed')
    expect(result.diagnostics.validationResult.issues.some((issue) => issue.type === 'missing-execution-context')).toBe(true)
    expect(result.diagnostics.selectedProviderId).toBeNull()
  })

  it('Error Scenarios: a blank profileId is rejected before any stage runs', () => {
    const orchestrator = createAIRuntimeOrchestrator()

    const result = orchestrator.run(makeRuntimeOrchestrationInputs({ profileId: '' }))

    expect(result.completionStatus).toBe('failed')
    expect(result.diagnostics.validationResult.issues.some((issue) => issue.type === 'missing-execution-context')).toBe(true)
  })

  it('catches an internally-inconsistent result from the coordinator rather than passing it through', () => {
    const inconsistentCoordinator: RuntimeCoordinator = {
      coordinate: () => makeAIRuntimeResult({ completionStatus: 'completed', success: null, failureReason: null }),
    }
    const orchestrator = createAIRuntimeOrchestrator({ coordinator: inconsistentCoordinator })

    const result = orchestrator.run(makeRuntimeOrchestrationInputs())

    expect(result.completionStatus).toBe('failed')
    expect(result.diagnostics.validationResult.issues.some((issue) => issue.type === 'invalid-final-result')).toBe(true)
  })

  it('Deterministic Execution: two orchestrators produce the same result for the same inputs', () => {
    const orchestratorA = createAIRuntimeOrchestrator()
    const orchestratorB = createAIRuntimeOrchestrator()
    const inputs = makeRuntimeOrchestrationInputs()

    expect(orchestratorA.run(inputs)).toEqual(orchestratorB.run(inputs))
  })
})
