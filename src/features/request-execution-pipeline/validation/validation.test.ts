import { describe, expect, it } from 'vitest'
import { createRequestValidator } from './DefaultRequestValidator'
import { makeRequestContext, makeRequestEnvelope, makeRequestMetadata, makePromptPayload, makeRequestConfiguration } from '../testFixtures'

describe('DefaultRequestValidator', () => {
  const validator = createRequestValidator()

  it('reports valid: true for a well-formed envelope', () => {
    expect(validator.validate(makeRequestEnvelope())).toEqual({ valid: true, issues: [] })
  })

  it('detects missing-provider for a blank provider id', () => {
    const envelope = makeRequestEnvelope({ context: makeRequestContext({ providerId: '' }) })
    const result = validator.validate(envelope)
    expect(result.issues.some((issue) => issue.type === 'missing-provider')).toBe(true)
  })

  it('detects missing-model for a blank model id', () => {
    const envelope = makeRequestEnvelope({ context: makeRequestContext({ modelId: '' }) })
    const result = validator.validate(envelope)
    expect(result.issues.some((issue) => issue.type === 'missing-model')).toBe(true)
  })

  it('detects invalid-prompt for a blank user prompt', () => {
    const envelope = makeRequestEnvelope({ payload: makePromptPayload({ userPrompt: '   ' }) })
    const result = validator.validate(envelope)
    expect(result.issues.some((issue) => issue.type === 'invalid-prompt')).toBe(true)
  })

  it('detects empty-payload (and invalid-prompt) when both prompts are blank', () => {
    const envelope = makeRequestEnvelope({ payload: makePromptPayload({ systemPrompt: '', userPrompt: '' }) })
    const result = validator.validate(envelope)
    expect(result.issues.some((issue) => issue.type === 'empty-payload')).toBe(true)
    expect(result.issues.some((issue) => issue.type === 'invalid-prompt')).toBe(true)
  })

  it('does not report empty-payload when only the system prompt is blank', () => {
    const envelope = makeRequestEnvelope({ payload: makePromptPayload({ systemPrompt: '', userPrompt: 'Explain fractions.' }) })
    const result = validator.validate(envelope)
    expect(result.issues.some((issue) => issue.type === 'empty-payload')).toBe(false)
  })

  it('detects invalid-metadata for a blank metadata field', () => {
    const envelope = makeRequestEnvelope({ metadata: makeRequestMetadata({ source: '' }) })
    const result = validator.validate(envelope)
    expect(result.issues.some((issue) => issue.type === 'invalid-metadata')).toBe(true)
  })

  it('detects invalid-execution-context for a blank learnerId/profileId', () => {
    const envelope = makeRequestEnvelope({ context: makeRequestContext({ learnerId: '' }) })
    const result = validator.validate(envelope)
    expect(result.issues.some((issue) => issue.type === 'invalid-execution-context')).toBe(true)
  })

  it('detects unsupported-configuration for an out-of-range temperature', () => {
    const envelope = makeRequestEnvelope({ configuration: makeRequestConfiguration({ temperature: 5 }) })
    const result = validator.validate(envelope)
    expect(result.issues.some((issue) => issue.type === 'unsupported-configuration')).toBe(true)
  })

  it('detects unsupported-configuration for a non-positive maxOutputTokens', () => {
    const envelope = makeRequestEnvelope({ configuration: makeRequestConfiguration({ maxOutputTokens: 0 }) })
    const result = validator.validate(envelope)
    expect(result.issues.some((issue) => issue.type === 'unsupported-configuration')).toBe(true)
  })
})
