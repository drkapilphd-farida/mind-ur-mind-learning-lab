import { describe, expect, it } from 'vitest'
import { createMentorResponseOrchestrationService } from './DefaultMentorResponseOrchestrationService'
import { makeFixedClock, makeMentorResponseOrchestrationInputs, makeSequentialIdGenerator } from '../testFixtures'

const NOW = '2026-06-01T00:00:00.000Z'

describe('DefaultMentorResponseOrchestrationService', () => {
  it('generate() produces a response, a valid validation result, and diagnostics together', () => {
    const service = createMentorResponseOrchestrationService({ clock: makeFixedClock(NOW), idGenerator: makeSequentialIdGenerator('response') })
    const inputs = makeMentorResponseOrchestrationInputs()

    const result = service.generate(inputs)

    expect(result.response.id).toBe('response-1')
    expect(result.response.metadata.generatedAt).toBe(NOW)
    expect(result.response.sections).toHaveLength(6)
    expect(result.validationResult).toEqual({ valid: true, issues: [] })
    expect(result.diagnostics.validationStatus).toBe('valid')
    expect(result.diagnostics.sectionCount).toBe(6)
  })

  it('uses default dependencies when no overrides are given', () => {
    const service = createMentorResponseOrchestrationService()
    const result = service.generate(makeMentorResponseOrchestrationInputs())
    expect(result.response.id).toBeTruthy()
    expect(result.response.metadata.generatedAt).toBeTruthy()
  })
})
