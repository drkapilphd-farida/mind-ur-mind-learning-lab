import type { RequestEnvelope } from './RequestEnvelope'
import type { RequestExecutionDiagnostics } from './RequestExecutionDiagnostics'
import type { RequestValidationResult } from './RequestValidationResult'

// Immutable — every field `readonly`. `RequestExecutionPipeline.execute()`'s
// own output — always returned, regardless of how malformed the input
// was; never a thrown exception.
export type PipelineResult = {
  readonly envelope: RequestEnvelope
  readonly validationResult: RequestValidationResult
  readonly diagnostics: RequestExecutionDiagnostics
}
