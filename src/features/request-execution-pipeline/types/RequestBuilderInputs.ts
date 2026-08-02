import type { RequestConfiguration } from './RequestConfiguration'
import type { SafetyConfiguration } from './SafetyConfiguration'

// Immutable — every field `readonly`. `ExecutionRequestBuilder.build()`'s
// own input — the raw, caller-supplied facts (possibly malformed;
// `ExecutionRequestBuilder` never validates, it only assembles).
export type RequestBuilderInputs = {
  readonly learnerId: string
  readonly profileId: string
  readonly providerId: string
  readonly modelId: string
  readonly systemPrompt: string
  readonly userPrompt: string
  readonly configuration: RequestConfiguration
  readonly safetyConfiguration: SafetyConfiguration
}
