import type { ResponseDiagnostics, ResponseEnvelope, ResponseProcessingValidation } from '../types'

// Pure — one of the brief's own 10 named responsibilities
// ("ResponseDiagnostics"). Assembles a full record of one response
// processing decision. `usagePresent`/`errorPresent` are passed in
// from the *raw* payload (`raw.usage !== null` / `raw.errorPayload !==
// null`) rather than inferred from the envelope — `UsageExtractor`
// defaults a missing usage to all-zero, so a real zero-token response
// would otherwise be indistinguishable from a genuinely-missing one,
// same reasoning `ResponseValidator` itself uses.
export function generateResponseDiagnostics(
  envelope: ResponseEnvelope,
  validationResult: ResponseProcessingValidation,
  usagePresent: boolean,
  errorPresent: boolean,
): ResponseDiagnostics {
  return {
    requestId: envelope.requestId,
    providerId: envelope.providerId,
    validationResult,
    finishReason: envelope.finishReason,
    usagePresent,
    errorPresent,
    contentLength: envelope.content.length,
  }
}
