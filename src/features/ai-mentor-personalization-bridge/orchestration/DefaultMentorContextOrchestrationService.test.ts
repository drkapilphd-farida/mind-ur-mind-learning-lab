import { describe, expect, it } from 'vitest'
import { createMentorContextOrchestrationService } from './DefaultMentorContextOrchestrationService'
import { makeFixedClock, makeMentorContextOrchestrationInputs, makeSequentialIdGenerator } from '../testFixtures'

const NOW = '2026-06-01T00:00:00.000Z'

describe('DefaultMentorContextOrchestrationService', () => {
  it('generate() produces a snapshot, a valid validation result, and diagnostics together for full inputs', () => {
    const service = createMentorContextOrchestrationService({ clock: makeFixedClock(NOW), idGenerator: makeSequentialIdGenerator('snapshot') })
    const inputs = makeMentorContextOrchestrationInputs()

    const result = service.generate(inputs)

    expect(result.snapshot.id).toBe('snapshot-1')
    expect(result.snapshot.metadata.generatedAt).toBe(NOW)
    expect(result.validationResult).toEqual({ valid: true, issues: [] })
    expect(result.diagnostics.validationStatus).toBe('valid')
    expect(result.diagnostics.contextCompleteness).toBe('complete')
  })

  it('reports an invalid validation result and empty diagnostics for all-null cross-feature inputs', () => {
    const service = createMentorContextOrchestrationService()
    const inputs = makeMentorContextOrchestrationInputs({ profile: null, executionPlan: null, recommendationSet: null, adaptation: null, memoryContext: null })

    const result = service.generate(inputs)

    expect(result.validationResult.valid).toBe(false)
    expect(result.validationResult.issues.map((issue) => issue.type)).toEqual(
      expect.arrayContaining(['missing-personalization', 'missing-execution-plan', 'missing-recommendations']),
    )
    expect(result.diagnostics.contextCompleteness).toBe('empty')
  })

  it('uses default dependencies when no overrides are given', () => {
    const service = createMentorContextOrchestrationService()
    const result = service.generate(makeMentorContextOrchestrationInputs())
    expect(result.snapshot.id).toBeTruthy()
    expect(result.snapshot.metadata.generatedAt).toBeTruthy()
  })
})
