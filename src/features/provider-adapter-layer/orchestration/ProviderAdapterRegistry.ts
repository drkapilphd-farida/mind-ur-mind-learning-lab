import type { AdapterProviderId, ProviderAdapterValidation } from '../types'
import type { DeterministicProviderAdapter } from './DeterministicProviderAdapter'

// "## Registry" (§ brief): "Support: Adapter Registration, Adapter
// Discovery, Capability Lookup, Provider Lookup, Metadata Lookup,
// Validation." `register` returns a `ProviderAdapterValidation` result
// rather than throwing — a duplicate registration is a recoverable
// rejection, never stored.
export interface ProviderAdapterRegistry {
  register(adapter: DeterministicProviderAdapter): ProviderAdapterValidation
  get(providerId: AdapterProviderId): DeterministicProviderAdapter | undefined
  list(): readonly DeterministicProviderAdapter[]
  has(providerId: AdapterProviderId): boolean
}
