import type { AdapterProviderId } from './AdapterProviderId'
import type { ProviderAdapterCapability } from './ProviderAdapterCapability'

// Immutable — every field `readonly`. The resolved capability bundle
// for one adapter — "Capabilities are metadata only. No implementation."
export type ProviderAdapterCapabilities = {
  readonly providerId: AdapterProviderId
  readonly supported: readonly ProviderAdapterCapability[]
}
