import { describe, expect, it } from 'vitest'
import { generateRequestExecutionDiagnostics } from './generateRequestExecutionDiagnostics'
import { makePromptPayload, makeRequestEnvelope, makeRequestValidationResult } from '../testFixtures'

describe('generateRequestExecutionDiagnostics', () => {
  it('collects the request id, provider, model, validation result, prompt lengths, and normalization status', () => {
    const envelope = makeRequestEnvelope({ id: 'req-1', payload: makePromptPayload({ systemPrompt: 'sys', userPrompt: 'usr!' }) })
    const validationResult = makeRequestValidationResult()

    const diagnostics = generateRequestExecutionDiagnostics(envelope, validationResult, true)

    expect(diagnostics).toEqual({
      requestId: 'req-1',
      providerId: envelope.context.providerId,
      modelId: envelope.context.modelId,
      validationResult: { valid: true, issues: [] },
      systemPromptLength: 3,
      userPromptLength: 4,
      normalizationApplied: true,
    })
  })

  it('reflects normalizationApplied: false when the pipeline skipped normalization', () => {
    const envelope = makeRequestEnvelope()
    const validationResult = makeRequestValidationResult({ valid: false, issues: [{ type: 'invalid-prompt', detail: 'blank' }] })

    const diagnostics = generateRequestExecutionDiagnostics(envelope, validationResult, false)

    expect(diagnostics.normalizationApplied).toBe(false)
    expect(diagnostics.validationResult.valid).toBe(false)
  })
})
