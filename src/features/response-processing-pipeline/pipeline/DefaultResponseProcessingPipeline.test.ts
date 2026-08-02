import { describe, expect, it } from 'vitest'
import { createResponseProcessingPipeline } from './DefaultResponseProcessingPipeline'
import { makeRawResponsePayload } from '../testFixtures'

describe('DefaultResponseProcessingPipeline', () => {
  it('processes a well-formed raw response into a normalized envelope', () => {
    const pipeline = createResponseProcessingPipeline()

    const result = pipeline.process(makeRawResponsePayload({ content: '  Fractions represent parts of a whole.  ' }))

    expect(result.validationResult).toEqual({ valid: true, issues: [] })
    expect(result.envelope.content).toBe('Fractions represent parts of a whole.')
  })

  it('Pipeline Integrity: is deterministic end-to-end for the same raw input', () => {
    const pipelineA = createResponseProcessingPipeline()
    const pipelineB = createResponseProcessingPipeline()
    const raw = makeRawResponsePayload()

    expect(pipelineA.process(raw)).toEqual(pipelineB.process(raw))
  })

  it('Error Scenarios: a completely empty raw response never throws — it returns a ResponseProcessingResult with issues', () => {
    const pipeline = createResponseProcessingPipeline()

    const result = pipeline.process(makeRawResponsePayload({ content: null, finishReason: null, usage: null, metadata: null, errorPayload: null }))

    expect(result.validationResult.valid).toBe(false)
    expect(result.validationResult.issues.some((issue) => issue.type === 'empty-response')).toBe(true)
    expect(result.validationResult.issues.some((issue) => issue.type === 'missing-content')).toBe(true)
    expect(result.validationResult.issues.some((issue) => issue.type === 'missing-usage')).toBe(true)
    expect(result.validationResult.issues.some((issue) => issue.type === 'invalid-metadata')).toBe(true)
    expect(result.validationResult.issues.some((issue) => issue.type === 'unsupported-finish-reason')).toBe(true)
  })

  it('Error Scenarios: a provider error payload is surfaced on the envelope and marked invalid', () => {
    const pipeline = createResponseProcessingPipeline()

    const result = pipeline.process(makeRawResponsePayload({ errorPayload: { code: 'rate_limited', message: 'Too many requests.' } }))

    expect(result.validationResult.valid).toBe(false)
    expect(result.envelope.error).toEqual({ code: 'rate_limited', message: 'Too many requests.' })
    expect(result.diagnostics.errorPresent).toBe(true)
  })

  it('does not normalize an invalid response — content passes through untrimmed', () => {
    const pipeline = createResponseProcessingPipeline()

    const result = pipeline.process(makeRawResponsePayload({ providerId: '', content: '  untrimmed  ' }))

    expect(result.validationResult.valid).toBe(false)
    expect(result.envelope.content).toBe('  untrimmed  ')
  })

  it('reflects usagePresent/errorPresent diagnostics straight from the raw payload, not the extracted envelope', () => {
    const pipeline = createResponseProcessingPipeline()

    const result = pipeline.process(makeRawResponsePayload({ usage: null }))

    expect(result.diagnostics.usagePresent).toBe(false)
    expect(result.envelope.usage).toEqual({ promptTokens: 0, completionTokens: 0, totalTokens: 0 })
  })
})
