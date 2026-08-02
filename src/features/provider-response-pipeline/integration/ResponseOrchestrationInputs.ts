import type { ProviderExecutionRequest } from '@/features/provider-request-pipeline'
import type { ResponseConfigurationFacts } from '../types'
import type { RawProviderResponse } from '../translation'

// The raw inputs a caller supplies for one response-orchestration run.
// `executionRequest` is used purely for correlation (`learnerId`/
// `profileId`/`version` — the request this response corresponds to),
// never re-executed. `rawResponse` is always synthetic/local (see this
// feature's own `index.ts` header) — no real or mock provider call
// happens anywhere in this arc.
export type ResponseOrchestrationInputs = {
  readonly learnerId: string
  readonly profileId: string
  readonly executionRequest: ProviderExecutionRequest
  readonly rawResponse: RawProviderResponse
  readonly configurationFacts: ResponseConfigurationFacts
}
