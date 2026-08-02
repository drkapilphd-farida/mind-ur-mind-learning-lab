import type { AdapterProviderId } from './AdapterProviderId'
import type { ProviderAdapterConfiguration } from './ProviderAdapterConfiguration'

// Immutable — every field `readonly`. `buildProviderPayload()`'s own
// output — the final deterministic, provider-shaped payload: the
// transformed request plus this adapter's own chosen model and default
// configuration. Never sent anywhere — "Adapters must never execute
// requests."
export type ProviderAdapterPayload = {
  readonly providerId: AdapterProviderId
  readonly model: string
  readonly messageCount: number
  readonly instructionCount: number
  readonly payloadSummary: readonly string[]
  readonly configuration: ProviderAdapterConfiguration
}
