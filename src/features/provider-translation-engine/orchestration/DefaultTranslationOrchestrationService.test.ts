import { describe, expect, it } from 'vitest'
import { createTranslationOrchestrationService } from './DefaultTranslationOrchestrationService'
import { makeFixedClock, makeSequentialIdGenerator, makeTranslationOrchestrationInputs } from '../testFixtures'

const NOW = '2026-06-01T00:00:00.000Z'

describe('DefaultTranslationOrchestrationService', () => {
  it('generate() produces a valid, complete request and diagnostics for the OpenAI profile', () => {
    const service = createTranslationOrchestrationService({ clock: makeFixedClock(NOW), idGenerator: makeSequentialIdGenerator('request') })
    const inputs = makeTranslationOrchestrationInputs({ providerId: 'openai' })

    const result = service.generate(inputs)

    expect(result.request.id).toBe('request-1')
    expect(result.request.providerId).toBe('openai')
    expect(result.request.metadata.generatedAt).toBe(NOW)
    expect(result.validationResult).toEqual({ valid: true, issues: [] })
    expect(result.diagnostics.validationStatus).toBe('valid')
    expect(result.diagnostics.translationCompleteness).toBe('complete')
    expect(result.diagnostics.providerProfile).toBe('openai')
  })

  it('produces a valid, complete result for the Anthropic profile too (folded system section)', () => {
    const service = createTranslationOrchestrationService()
    const result = service.generate(makeTranslationOrchestrationInputs({ providerId: 'anthropic' }))
    expect(result.request.messages).toHaveLength(5)
    expect(result.diagnostics.translationCompleteness).toBe('complete')
  })

  it('uses default dependencies when no overrides are given', () => {
    const service = createTranslationOrchestrationService()
    const result = service.generate(makeTranslationOrchestrationInputs())
    expect(result.request.id).toBeTruthy()
    expect(result.request.metadata.generatedAt).toBeTruthy()
  })
})
