import { describe, expect, it } from 'vitest'
import { createFinishReasonResolver } from '../finishReason'
import { createResponseValidator } from './DefaultResponseValidator'
import { makeRawResponsePayload } from '../testFixtures'

describe('DefaultResponseValidator', () => {
  const validator = createResponseValidator(createFinishReasonResolver())

  it('reports valid: true for a well-formed raw response', () => {
    expect(validator.validate(makeRawResponsePayload())).toEqual({ valid: true, issues: [] })
  })

  it('detects empty-response when every field is null', () => {
    const raw = makeRawResponsePayload({ content: null, finishReason: null, usage: null, metadata: null, errorPayload: null })
    const result = validator.validate(raw)
    expect(result.issues.some((issue) => issue.type === 'empty-response')).toBe(true)
  })

  it('detects invalid-response for a blank providerId', () => {
    const result = validator.validate(makeRawResponsePayload({ providerId: '' }))
    expect(result.issues.some((issue) => issue.type === 'invalid-response')).toBe(true)
  })

  it('detects missing-content for null or blank content', () => {
    expect(validator.validate(makeRawResponsePayload({ content: null })).issues.some((issue) => issue.type === 'missing-content')).toBe(true)
    expect(validator.validate(makeRawResponsePayload({ content: '   ' })).issues.some((issue) => issue.type === 'missing-content')).toBe(true)
  })

  it('detects invalid-metadata for null metadata or a blank field', () => {
    expect(validator.validate(makeRawResponsePayload({ metadata: null })).issues.some((issue) => issue.type === 'invalid-metadata')).toBe(true)
    expect(
      validator.validate(makeRawResponsePayload({ metadata: { modelUsed: '', requestId: 'req-1' } })).issues.some((issue) => issue.type === 'invalid-metadata'),
    ).toBe(true)
  })

  it('detects missing-usage for a null usage payload', () => {
    const result = validator.validate(makeRawResponsePayload({ usage: null }))
    expect(result.issues.some((issue) => issue.type === 'missing-usage')).toBe(true)
  })

  it('detects unsupported-finish-reason for an unrecognized or null finishReason', () => {
    expect(validator.validate(makeRawResponsePayload({ finishReason: 'tool_calls' })).issues.some((issue) => issue.type === 'unsupported-finish-reason')).toBe(
      true,
    )
    expect(validator.validate(makeRawResponsePayload({ finishReason: null })).issues.some((issue) => issue.type === 'unsupported-finish-reason')).toBe(true)
  })

  it('detects provider-error-payload when an error payload is present', () => {
    const result = validator.validate(makeRawResponsePayload({ errorPayload: { code: 'rate_limited', message: 'Too many requests.' } }))
    expect(result.issues.some((issue) => issue.type === 'provider-error-payload')).toBe(true)
  })
})
