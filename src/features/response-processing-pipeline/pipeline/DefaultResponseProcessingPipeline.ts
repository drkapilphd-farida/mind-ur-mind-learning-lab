import { createErrorResponseMapper } from '../errorMapping'
import type { ErrorResponseMapper } from '../errorMapping'
import { createFinishReasonResolver } from '../finishReason'
import type { FinishReasonResolver } from '../finishReason'
import { generateResponseDiagnostics } from '../diagnostics'
import { createResponseMetadataExtractor } from '../metadata'
import type { ResponseMetadataExtractor } from '../metadata'
import { createResponseNormalizer } from '../normalization'
import type { ResponseNormalizer } from '../normalization'
import type { RawResponsePayload, ResponseEnvelope, ResponseProcessingResult } from '../types'
import { createUsageExtractor } from '../usage'
import type { UsageExtractor } from '../usage'
import { createResponseValidator } from '../validation'
import type { ResponseValidator } from '../validation'
import type { ResponseProcessingPipeline } from './ResponseProcessingPipeline'

export type ResponseProcessingPipelineDependencies = {
  responseValidator: ResponseValidator
  metadataExtractor: ResponseMetadataExtractor
  usageExtractor: UsageExtractor
  finishReasonResolver: FinishReasonResolver
  errorResponseMapper: ErrorResponseMapper
  responseNormalizer: ResponseNormalizer
}

function createDefaultDependencies(): ResponseProcessingPipelineDependencies {
  const finishReasonResolver = createFinishReasonResolver()

  return {
    responseValidator: createResponseValidator(finishReasonResolver),
    metadataExtractor: createResponseMetadataExtractor(),
    usageExtractor: createUsageExtractor(),
    finishReasonResolver,
    errorResponseMapper: createErrorResponseMapper(),
    responseNormalizer: createResponseNormalizer(),
  }
}

// "validate (raw) → extract metadata/usage → resolve finish reason →
// map error → assemble envelope → normalize (only if valid) →
// diagnostics → ResponseProcessingResult" — never throws, regardless
// of how malformed the raw payload was.
export class DefaultResponseProcessingPipeline implements ResponseProcessingPipeline {
  constructor(private readonly dependencies: ResponseProcessingPipelineDependencies) {}

  process(raw: RawResponsePayload): ResponseProcessingResult {
    const validationResult = this.dependencies.responseValidator.validate(raw)

    const metadata = this.dependencies.metadataExtractor.extract(raw.metadata)
    const usage = this.dependencies.usageExtractor.extract(raw.usage)
    const finishReason = this.dependencies.finishReasonResolver.resolve(raw.finishReason)
    const mappedError = this.dependencies.errorResponseMapper.map(raw.errorPayload)

    const envelope: ResponseEnvelope = {
      requestId: metadata.requestId,
      providerId: raw.providerId,
      content: raw.content ?? '',
      finishReason,
      usage,
      metadata,
      error: mappedError,
    }

    const finalEnvelope = validationResult.valid ? this.dependencies.responseNormalizer.normalize(envelope) : envelope
    const diagnostics = generateResponseDiagnostics(finalEnvelope, validationResult, raw.usage !== null, raw.errorPayload !== null)

    return { envelope: finalEnvelope, validationResult, diagnostics }
  }
}

export function createResponseProcessingPipeline(overrides: Partial<ResponseProcessingPipelineDependencies> = {}): ResponseProcessingPipeline {
  return new DefaultResponseProcessingPipeline({ ...createDefaultDependencies(), ...overrides })
}
