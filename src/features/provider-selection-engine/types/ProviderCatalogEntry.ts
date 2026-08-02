import type { ProviderAvailabilityState } from './ProviderAvailabilityState'
import type { ProviderSelectionConfiguration } from './ProviderSelectionConfiguration'
import type { SelectionCapability } from './SelectionCapability'
import type { SelectionProviderId } from './SelectionProviderId'

// Immutable — every field `readonly`. One catalog/registry entry per
// provider — bundles every "Support deterministic selection based on"
// dimension (§ brief) except "Requested Capability"/"Preferred
// Provider" (those come from the caller's own
// `ProviderSelectionRequest`, not the entry). `priority`: lower number
// = more preferred (rank-like; 1 is most preferred).
export type ProviderCatalogEntry = {
  readonly providerId: SelectionProviderId
  readonly priority: number
  readonly availability: ProviderAvailabilityState
  readonly supportedCapabilities: readonly SelectionCapability[]
  readonly supportedModels: readonly string[]
  readonly configuration: ProviderSelectionConfiguration
}
