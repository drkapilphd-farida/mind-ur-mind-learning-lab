import type { ProviderRequest } from '@/features/provider-translation-engine'
import type { PipelineConfigurationFacts } from '../types'

// The raw inputs a caller supplies for one pipeline-orchestration run.
// `providerRequest` is required (non-null) — `provider-translation-engine`
// already resolved its own upstream nullability into a best-effort
// request.
export type PipelineOrchestrationInputs = {
  readonly learnerId: string
  readonly profileId: string
  readonly providerRequest: ProviderRequest
  readonly configurationFacts: PipelineConfigurationFacts
}
