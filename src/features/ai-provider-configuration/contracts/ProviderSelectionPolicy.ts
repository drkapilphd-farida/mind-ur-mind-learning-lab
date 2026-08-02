import type { ActiveProviderId, ProviderRegistryConfiguration } from '../types'

// "Provider Selection Policy" — turns a whole configuration snapshot
// into a single requested provider id, honoring `enabled` and feature
// flags before RuntimeProviderResolver goes on to check credentials/
// health. Deliberately its own seam (not inlined into
// RuntimeProviderResolver) so a future policy — e.g. "prefer the
// cheapest enabled provider" — is a drop-in replacement.
export interface ProviderSelectionPolicy {
  selectActiveProviderId(config: ProviderRegistryConfiguration): ActiveProviderId
}
