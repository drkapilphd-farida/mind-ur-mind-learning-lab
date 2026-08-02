import type { PipelineInputs } from '../pipeline'
import type { PipelineOrchestrationInputs } from './PipelineOrchestrationInputs'

// Pure — the one function that turns a real `ProviderRequest` (from
// the approved Provider Translation Engine) into the fully
// self-contained `PipelineInputs` the Request Pipeline consumes. This
// is the *only* place `ProviderRequest`'s own shape is inspected —
// nothing in `../pipeline/` or `../validation/` knows this type
// exists.
export function buildPipelineInputs(inputs: PipelineOrchestrationInputs): PipelineInputs {
  const { providerRequest } = inputs

  return {
    learnerId: inputs.learnerId,
    profileId: inputs.profileId,
    providerId: providerRequest.providerId,
    sourceVersion: providerRequest.version,
    facts: providerRequest.context.facts,
    messages: providerRequest.messages,
    instructions: providerRequest.instructions,
  }
}
