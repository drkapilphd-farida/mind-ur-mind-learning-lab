import { describe, expect, it } from 'vitest'
import { createExecutionContextResolver } from '../context'
import { createExecutionRequestBuilder } from '../builder'
import { createRequestMetadataAssembler } from '../metadata'
import { createRequestNormalizer } from '../normalization'
import { createRequestValidator } from '../validation'
import { createRequestExecutionPipeline } from './DefaultRequestExecutionPipeline'
import { makeFixedClock, makeRequestBuilderInputs, makeSequentialIdGenerator } from '../testFixtures'

describe('DefaultRequestExecutionPipeline', () => {
  it('Pipeline Creation: createRequestExecutionPipeline() works with zero overrides', () => {
    const pipeline = createRequestExecutionPipeline()

    const result = pipeline.execute(makeRequestBuilderInputs())

    expect(result.validationResult.valid).toBe(true)
    expect(result.envelope.id).toEqual(expect.any(String))
  })

  it('Pipeline Integrity: is deterministic end-to-end with fixed Clock/IdGenerator', () => {
    const requestBuilder = createExecutionRequestBuilder(
      makeSequentialIdGenerator('req'),
      createExecutionContextResolver(),
      createRequestMetadataAssembler(makeFixedClock('2026-01-01T00:00:00.000Z')),
    )
    const pipelineA = createRequestExecutionPipeline({ requestBuilder, requestValidator: createRequestValidator(), requestNormalizer: createRequestNormalizer() })
    const pipelineB = createRequestExecutionPipeline({
      requestBuilder: createExecutionRequestBuilder(
        makeSequentialIdGenerator('req'),
        createExecutionContextResolver(),
        createRequestMetadataAssembler(makeFixedClock('2026-01-01T00:00:00.000Z')),
      ),
      requestValidator: createRequestValidator(),
      requestNormalizer: createRequestNormalizer(),
    })

    const inputs = makeRequestBuilderInputs()
    const resultA = pipelineA.execute(inputs)
    const resultB = pipelineB.execute(inputs)

    expect(resultA).toEqual(resultB)
  })

  it('normalizes a valid request (trims whitespace from prompts)', () => {
    const pipeline = createRequestExecutionPipeline()

    const result = pipeline.execute(makeRequestBuilderInputs({ systemPrompt: '  sys  ', userPrompt: '  usr  ' }))

    expect(result.envelope.payload).toEqual({ systemPrompt: 'sys', userPrompt: 'usr' })
    expect(result.diagnostics.normalizationApplied).toBe(true)
  })

  it('Error Handling: a completely blank/invalid input never throws — it returns a PipelineResult with issues', () => {
    const pipeline = createRequestExecutionPipeline()

    const result = pipeline.execute(
      makeRequestBuilderInputs({ providerId: '', modelId: '', systemPrompt: '', userPrompt: '', configuration: { temperature: 99, maxOutputTokens: -1 } }),
    )

    expect(result.validationResult.valid).toBe(false)
    expect(result.validationResult.issues.length).toBeGreaterThan(0)
    expect(result.diagnostics.normalizationApplied).toBe(false)
  })

  it('does not normalize an invalid request — prompts pass through untrimmed', () => {
    const pipeline = createRequestExecutionPipeline()

    const result = pipeline.execute(makeRequestBuilderInputs({ providerId: '', systemPrompt: '  sys  ', userPrompt: '  usr  ' }))

    expect(result.validationResult.valid).toBe(false)
    expect(result.envelope.payload).toEqual({ systemPrompt: '  sys  ', userPrompt: '  usr  ' })
  })
})
