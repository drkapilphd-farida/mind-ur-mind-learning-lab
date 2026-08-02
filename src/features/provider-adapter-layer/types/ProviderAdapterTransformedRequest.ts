import type { AdapterProviderId } from './AdapterProviderId'

// Immutable — every field `readonly`. `transformExecutionRequest()`'s
// own output — a provider-tagged, still provider-agnostic reduction of
// `ProviderAdapterExecutionRequest` (drops the raw request `id`, which
// this adapter layer never needs downstream). `buildProviderPayload()`
// is the next step, adding this adapter's own model/configuration
// choice on top.
export type ProviderAdapterTransformedRequest = {
  readonly providerId: AdapterProviderId
  readonly messageCount: number
  readonly instructionCount: number
  readonly payloadSummary: readonly string[]
}
