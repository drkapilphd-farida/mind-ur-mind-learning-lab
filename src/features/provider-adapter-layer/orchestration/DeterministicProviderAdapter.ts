import type {
  AdapterProviderId,
  ProviderAdapterExecutionRequest,
  ProviderAdapterExecutionResult,
  ProviderAdapterMetadata,
  ProviderAdapterNormalizedResponse,
  ProviderAdapterPayload,
  ProviderAdapterRawResponse,
  ProviderAdapterTransformedRequest,
  ProviderAdapterValidation,
} from '../types'

// The brief's own "ProviderAdapter" contract, renamed — real, exact
// collisions found via repo-wide grep with `ai-provider/contracts/
// ProviderAdapter.ts` (a different, `AIProvider`-extending contract
// with `initialize/shutdown/isReady`) and `ai-mentor/contracts/
// ProviderAdapter.ts` (a different, mentor-conversation-specific
// contract). Renamed to echo the brief's own repeated language
// ("deterministic adapter infrastructure/definitions/methods").
// `DefaultProviderAdapter` (the brief's exact, uncolliding name) is the
// one concrete implementation. "Each adapter must expose deterministic
// methods for" (§ brief) the 6 methods below — "Adapters must never
// execute requests. Execution remains inside the Provider Execution
// Engine."
export interface DeterministicProviderAdapter {
  readonly providerId: AdapterProviderId
  readonly metadata: ProviderAdapterMetadata

  validateRequest(request: ProviderAdapterExecutionRequest): ProviderAdapterValidation
  transformExecutionRequest(request: ProviderAdapterExecutionRequest): ProviderAdapterTransformedRequest
  buildProviderPayload(transformed: ProviderAdapterTransformedRequest): ProviderAdapterPayload
  normalizeProviderResponse(raw: ProviderAdapterRawResponse): ProviderAdapterNormalizedResponse
  validateProviderResponse(response: ProviderAdapterNormalizedResponse): ProviderAdapterValidation
  buildExecutionResult(response: ProviderAdapterNormalizedResponse, sessionId: string): ProviderAdapterExecutionResult
}
