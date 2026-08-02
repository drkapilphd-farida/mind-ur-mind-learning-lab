import { describe, expect, it } from 'vitest'
import { createMentorPromptOrchestrationService } from './DefaultMentorPromptOrchestrationService'
import { makeFixedClock, makeMentorPromptOrchestrationInputs, makeSequentialIdGenerator } from '../testFixtures'

const NOW = '2026-06-01T00:00:00.000Z'

describe('DefaultMentorPromptOrchestrationService', () => {
  it('generate() produces a payload, a valid validation result, and diagnostics together', () => {
    const service = createMentorPromptOrchestrationService({ clock: makeFixedClock(NOW), idGenerator: makeSequentialIdGenerator('payload') })
    const inputs = makeMentorPromptOrchestrationInputs()

    const result = service.generate(inputs)

    expect(result.payload.id).toBe('payload-1')
    expect(result.payload.metadata.generatedAt).toBe(NOW)
    expect(result.payload.sections).toHaveLength(6)
    expect(result.validationResult).toEqual({ valid: true, issues: [] })
    expect(result.diagnostics.validationStatus).toBe('valid')
    expect(result.diagnostics.sectionCount).toBe(6)
  })

  it('uses default dependencies when no overrides are given', () => {
    const service = createMentorPromptOrchestrationService()
    const result = service.generate(makeMentorPromptOrchestrationInputs())
    expect(result.payload.id).toBeTruthy()
    expect(result.payload.metadata.generatedAt).toBeTruthy()
  })
})
