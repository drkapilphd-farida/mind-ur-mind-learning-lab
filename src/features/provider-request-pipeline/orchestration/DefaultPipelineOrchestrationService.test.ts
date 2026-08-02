import { describe, expect, it } from 'vitest'
import { createPipelineOrchestrationService } from './DefaultPipelineOrchestrationService'
import { makeFixedClock, makePipelineOrchestrationInputs, makeSequentialIdGenerator } from '../testFixtures'

const NOW = '2026-06-01T00:00:00.000Z'

describe('DefaultPipelineOrchestrationService', () => {
  it('generate() produces a valid, complete execution request and diagnostics', () => {
    const service = createPipelineOrchestrationService({ clock: makeFixedClock(NOW), idGenerator: makeSequentialIdGenerator('exec-request') })
    const inputs = makePipelineOrchestrationInputs()

    const result = service.generate(inputs)

    expect(result.request.id).toBe('exec-request-1')
    expect(result.request.metadata.generatedAt).toBe(NOW)
    expect(result.request.modelId).toBeTruthy()
    expect(result.validationResult).toEqual({ valid: true, issues: [] })
    expect(result.diagnostics.validationStatus).toBe('valid')
    expect(result.diagnostics.requestCompleteness).toBe('complete')
  })

  it('uses default dependencies when no overrides are given', () => {
    const service = createPipelineOrchestrationService()
    const result = service.generate(makePipelineOrchestrationInputs())
    expect(result.request.id).toBeTruthy()
    expect(result.request.metadata.generatedAt).toBeTruthy()
  })
})
