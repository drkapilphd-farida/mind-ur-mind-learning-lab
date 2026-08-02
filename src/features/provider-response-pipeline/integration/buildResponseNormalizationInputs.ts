import type { RawProviderResponse, ResponseNormalizationInputs } from '../translation'
import type { ResponseOrchestrationInputs } from './ResponseOrchestrationInputs'

export type ResponseNormalizationComposition = {
  readonly rawResponse: RawProviderResponse
  readonly normalizationInputs: ResponseNormalizationInputs
}

// Pure — the one function that turns a real `ProviderExecutionRequest`
// (from the approved Provider Request Pipeline) into the fully
// self-contained `ResponseNormalizationInputs` the Response
// Translation consumes, alongside the raw response passed straight
// through. This is the *only* place `ProviderExecutionRequest`'s own
// shape is inspected — nothing in `../translation/` or `../validation/`
// knows this type exists.
export function buildResponseNormalizationInputs(inputs: ResponseOrchestrationInputs): ResponseNormalizationComposition {
  return {
    rawResponse: inputs.rawResponse,
    normalizationInputs: { learnerId: inputs.learnerId, profileId: inputs.profileId },
  }
}
