import type { AdapterProviderId, ProviderAdapterCapability } from '../types'
import type { DeterministicProviderAdapter } from './DeterministicProviderAdapter'
import type { ProviderAdapterRegistry } from './ProviderAdapterRegistry'

// Stateless lookup logic over an injected registry — "Adapter
// Resolution" and "Capability Matching" (§ brief's own Tests list).
export interface ProviderAdapterResolver {
  resolve(registry: ProviderAdapterRegistry, providerId: AdapterProviderId): DeterministicProviderAdapter | undefined
  resolveByCapability(registry: ProviderAdapterRegistry, capability: ProviderAdapterCapability): readonly DeterministicProviderAdapter[]
}
