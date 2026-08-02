import { createExecutionContextResolver } from '../context'
import { randomIdGenerator, systemClock } from '../adapters'
import { createExecutionRequestBuilder } from '../builder'
import type { ExecutionRequestBuilder } from '../builder'
import { generateRequestExecutionDiagnostics } from '../diagnostics'
import { createRequestMetadataAssembler } from '../metadata'
import { createRequestNormalizer } from '../normalization'
import type { RequestNormalizer } from '../normalization'
import { createRequestValidator } from '../validation'
import type { RequestValidator } from '../validation'
import type { PipelineResult, RequestBuilderInputs } from '../types'
import type { RequestExecutionPipeline } from './RequestExecutionPipeline'

export type RequestExecutionPipelineDependencies = {
  requestBuilder: ExecutionRequestBuilder
  requestValidator: RequestValidator
  requestNormalizer: RequestNormalizer
}

function createDefaultDependencies(): RequestExecutionPipelineDependencies {
  const contextResolver = createExecutionContextResolver()
  const metadataAssembler = createRequestMetadataAssembler(systemClock)

  return {
    requestBuilder: createExecutionRequestBuilder(randomIdGenerator, contextResolver, metadataAssembler),
    requestValidator: createRequestValidator(),
    requestNormalizer: createRequestNormalizer(),
  }
}

// "build → validate → normalize (only if valid) → diagnostics →
// PipelineResult" — never throws, regardless of how malformed the
// input was.
export class DefaultRequestExecutionPipeline implements RequestExecutionPipeline {
  constructor(private readonly dependencies: RequestExecutionPipelineDependencies) {}

  execute(inputs: RequestBuilderInputs): PipelineResult {
    const envelope = this.dependencies.requestBuilder.build(inputs)
    const validationResult = this.dependencies.requestValidator.validate(envelope)
    const normalizationApplied = validationResult.valid
    const finalEnvelope = normalizationApplied ? this.dependencies.requestNormalizer.normalize(envelope) : envelope
    const diagnostics = generateRequestExecutionDiagnostics(finalEnvelope, validationResult, normalizationApplied)

    return { envelope: finalEnvelope, validationResult, diagnostics }
  }
}

export function createRequestExecutionPipeline(overrides: Partial<RequestExecutionPipelineDependencies> = {}): RequestExecutionPipeline {
  return new DefaultRequestExecutionPipeline({ ...createDefaultDependencies(), ...overrides })
}
