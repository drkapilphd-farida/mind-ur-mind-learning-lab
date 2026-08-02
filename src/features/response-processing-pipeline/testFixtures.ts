// Shared test-only fixtures for this feature's own test suite — same
// convention as `@/features/request-execution-pipeline/testFixtures.ts`.
// Not itself a *.test.ts file, so vitest's `include` glob never picks
// it up as a test file. Every builder's defaults are valid per this
// feature's own validator, so tests only need to override the one
// field under test.
import type {
  FinishReason,
  MappedError,
  RawErrorPayload,
  RawResponseMetadataPayload,
  RawResponsePayload,
  RawUsagePayload,
  ResponseDiagnostics,
  ResponseEnvelope,
  ResponseMetadata,
  ResponseProcessingResult,
  ResponseProcessingValidation,
  ResponseUsage,
} from './types'

export function makeRawUsagePayload(overrides: Partial<RawUsagePayload> = {}): RawUsagePayload {
  return { promptTokens: 12, completionTokens: 34, totalTokens: 46, ...overrides }
}

export function makeRawErrorPayload(overrides: Partial<RawErrorPayload> = {}): RawErrorPayload {
  return { code: 'rate_limited', message: 'Too many requests.', ...overrides }
}

export function makeRawResponseMetadataPayload(overrides: Partial<RawResponseMetadataPayload> = {}): RawResponseMetadataPayload {
  return { modelUsed: 'gpt-4o', requestId: 'request-1', ...overrides }
}

export function makeRawResponsePayload(overrides: Partial<RawResponsePayload> = {}): RawResponsePayload {
  return {
    providerId: 'openai',
    content: 'Fractions represent parts of a whole.',
    finishReason: 'stop',
    usage: makeRawUsagePayload(),
    metadata: makeRawResponseMetadataPayload(),
    errorPayload: null,
    ...overrides,
  }
}

export function makeResponseUsage(overrides: Partial<ResponseUsage> = {}): ResponseUsage {
  return { promptTokens: 12, completionTokens: 34, totalTokens: 46, ...overrides }
}

export function makeResponseMetadata(overrides: Partial<ResponseMetadata> = {}): ResponseMetadata {
  return { modelUsed: 'gpt-4o', requestId: 'request-1', ...overrides }
}

export function makeMappedError(overrides: Partial<MappedError> = {}): MappedError {
  return { code: 'rate_limited', message: 'Too many requests.', ...overrides }
}

export function makeResponseEnvelope(overrides: Partial<ResponseEnvelope> = {}): ResponseEnvelope {
  return {
    requestId: 'request-1',
    providerId: 'openai',
    content: 'Fractions represent parts of a whole.',
    finishReason: 'stop' as FinishReason,
    usage: makeResponseUsage(),
    metadata: makeResponseMetadata(),
    error: null,
    ...overrides,
  }
}

export function makeResponseProcessingValidation(overrides: Partial<ResponseProcessingValidation> = {}): ResponseProcessingValidation {
  return { valid: true, issues: [], ...overrides }
}

export function makeResponseDiagnostics(overrides: Partial<ResponseDiagnostics> = {}): ResponseDiagnostics {
  return {
    requestId: 'request-1',
    providerId: 'openai',
    validationResult: makeResponseProcessingValidation(),
    finishReason: 'stop',
    usagePresent: true,
    errorPresent: false,
    contentLength: 38,
    ...overrides,
  }
}

export function makeResponseProcessingResult(overrides: Partial<ResponseProcessingResult> = {}): ResponseProcessingResult {
  return {
    envelope: makeResponseEnvelope(),
    validationResult: makeResponseProcessingValidation(),
    diagnostics: makeResponseDiagnostics(),
    ...overrides,
  }
}
