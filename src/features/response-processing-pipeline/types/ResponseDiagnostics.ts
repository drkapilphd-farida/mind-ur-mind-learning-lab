import type { FinishReason } from './FinishReason'
import type { ResponseProcessingValidation } from './ResponseProcessingValidation'

// Immutable — every field `readonly`. One of the brief's own 10 named
// responsibilities — no naming collision found, used brief-exact.
export type ResponseDiagnostics = {
  readonly requestId: string
  readonly providerId: string
  readonly validationResult: ResponseProcessingValidation
  readonly finishReason: FinishReason
  readonly usagePresent: boolean
  readonly errorPresent: boolean
  readonly contentLength: number
}
