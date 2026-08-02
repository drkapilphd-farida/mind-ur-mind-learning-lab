import { describe, expect, it } from 'vitest'
import { createAIOrchestrationService } from './DefaultAIOrchestrationService'
import { makeAIOrchestrationInputs, makeFixedClock, makeSequentialIdGenerator } from '../testFixtures'

const NOW = '2026-06-01T00:00:00.000Z'

describe('DefaultAIOrchestrationService', () => {
  it('generate() runs the full 6-stage pipeline end-to-end and completes', () => {
    const service = createAIOrchestrationService({ clock: makeFixedClock(NOW), idGenerator: makeSequentialIdGenerator('orchestration') })
    const inputs = makeAIOrchestrationInputs()

    const { result, validationResult, diagnostics } = service.generate(inputs)

    expect(result.id).toBe('orchestration-1')
    expect(result.completionStatus).toBe('completed')
    expect(result.context.stage).toBe('completed')
    expect(result.context.completedStages).toEqual(['initialized', 'context-ready', 'prompt-ready', 'request-ready', 'response-normalized', 'completed'])
    expect(result.responseText).toBeTruthy()
    expect(result.providerId).toBe('openai')
    expect(result.metadata.generatedAt).toBe(NOW)
    expect(validationResult).toEqual({ valid: true, issues: [] })
    expect(diagnostics.completionStatus).toBe('completed')
    expect(diagnostics.validationStatus).toBe('valid')
  })

  it('completes end-to-end for the anthropic and gemini profiles too', () => {
    const service = createAIOrchestrationService()
    for (const providerId of ['anthropic', 'gemini'] as const) {
      const { result } = service.generate(makeAIOrchestrationInputs({ providerId }))
      expect(result.completionStatus).toBe('completed')
      expect(result.providerId).toBe(providerId)
    }
  })

  it('short-circuits to failed when the context stage itself fails validation (no personalization, no recommendations)', () => {
    const service = createAIOrchestrationService({ clock: makeFixedClock(NOW), idGenerator: makeSequentialIdGenerator('orchestration') })
    const inputs = makeAIOrchestrationInputs({
      recommendationSet: { id: 'set-1', version: 1, groups: [], metadata: { learnerId: 'learner-1', profileId: 'profile-1', source: 'test', generatedAt: NOW } },
    })

    const { result, validationResult } = service.generate(inputs)

    expect(result.completionStatus).toBe('failed')
    expect(result.context.stage).toBe('failed')
    expect(result.context.completedStages).toEqual(['initialized', 'failed'])
    expect(result.responseText).toBeNull()
    expect(result.providerId).toBeNull()
    expect(validationResult.valid).toBe(true)
  })

  it('uses default dependencies when no overrides are given', () => {
    const service = createAIOrchestrationService()
    const { result } = service.generate(makeAIOrchestrationInputs())
    expect(result.id).toBeTruthy()
    expect(result.metadata.generatedAt).toBeTruthy()
  })
})
