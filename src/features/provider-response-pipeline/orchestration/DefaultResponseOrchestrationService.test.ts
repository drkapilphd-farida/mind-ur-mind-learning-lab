import { describe, expect, it } from 'vitest'
import { createResponseOrchestrationService } from './DefaultResponseOrchestrationService'
import { makeFixedClock, makeResponseOrchestrationInputs, makeSequentialIdGenerator } from '../testFixtures'

const NOW = '2026-06-01T00:00:00.000Z'

describe('DefaultResponseOrchestrationService', () => {
  it('generate() produces a valid, complete normalized response and diagnostics', () => {
    const service = createResponseOrchestrationService({ clock: makeFixedClock(NOW), idGenerator: makeSequentialIdGenerator('response') })
    const inputs = makeResponseOrchestrationInputs()

    const result = service.generate(inputs)

    expect(result.response.id).toBe('response-1')
    expect(result.response.providerId).toBe('openai')
    expect(result.response.metadata.generatedAt).toBe(NOW)
    expect(result.validationResult).toEqual({ valid: true, issues: [] })
    expect(result.diagnostics.validationStatus).toBe('valid')
    expect(result.diagnostics.responseCompleteness).toBe('complete')
  })

  it('normalizes a non-OpenAI profile correctly end-to-end', () => {
    const service = createResponseOrchestrationService()
    const inputs = makeResponseOrchestrationInputs({ rawResponse: { providerId: 'anthropic', response: { content: [{ text: 'hi' }], stop_reason: 'end_turn', usage: { input_tokens: 3, output_tokens: 2 } } } })
    const result = service.generate(inputs)
    expect(result.response.providerId).toBe('anthropic')
    expect(result.response.content).toEqual({ text: 'hi', finishReason: 'stop' })
  })

  it('uses default dependencies when no overrides are given', () => {
    const service = createResponseOrchestrationService()
    const result = service.generate(makeResponseOrchestrationInputs())
    expect(result.response.id).toBeTruthy()
    expect(result.response.metadata.generatedAt).toBeTruthy()
  })
})
