import type { ProviderExecutionRequest } from '../types'
import { resolveProviderConfiguration } from './resolveProviderConfiguration'
import type { PipelineInputs } from './PipelineInputs'

// Pure — "Convert ... into execution-ready request objects. No
// provider execution." Resolves the deterministic per-provider
// configuration and appends its safety instruction to the passthrough
// instruction list — "Request version" is carried over from the
// source `ProviderRequest.version`, never invented.
export function buildProviderExecutionRequest(inputs: PipelineInputs, now: string, id: string): ProviderExecutionRequest {
  const configuration = resolveProviderConfiguration(inputs.providerId)

  return {
    id,
    version: inputs.sourceVersion,
    providerId: inputs.providerId,
    modelId: configuration.modelId,
    context: { learnerId: inputs.learnerId, profileId: inputs.profileId, facts: inputs.facts },
    options: configuration.options,
    messages: inputs.messages,
    instructions: [...inputs.instructions, configuration.safetyInstruction],
    metadata: { learnerId: inputs.learnerId, profileId: inputs.profileId, source: 'provider-request-pipeline', generatedAt: now },
  }
}
