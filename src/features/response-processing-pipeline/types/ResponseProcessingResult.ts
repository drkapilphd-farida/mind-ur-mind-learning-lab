import type { ResponseDiagnostics } from './ResponseDiagnostics'
import type { ResponseEnvelope } from './ResponseEnvelope'
import type { ResponseProcessingValidation } from './ResponseProcessingValidation'

// Immutable — every field `readonly`. The brief's own "PipelineResult"
// responsibility, renamed — a real, exact collision found via
// repo-wide grep with
// `request-execution-pipeline/types/PipelineResult.ts` (this session's
// own Sprint 39). Renamed to echo this sprint's own feature name.
// `ResponseProcessingPipeline.process()`'s own output — always
// returned, regardless of how malformed the raw payload was; never a
// thrown exception.
export type ResponseProcessingResult = {
  readonly envelope: ResponseEnvelope
  readonly validationResult: ResponseProcessingValidation
  readonly diagnostics: ResponseDiagnostics
}
