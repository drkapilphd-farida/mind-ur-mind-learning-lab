import { resolveProviderAdapterCapabilities } from '../capabilities'
import type { AdapterProviderId, ProviderAdapterCapability } from '../types'
import type { DeterministicProviderAdapter } from './DeterministicProviderAdapter'
import type { ProviderAdapterRegistry } from './ProviderAdapterRegistry'
import type { ProviderAdapterResolver } from './ProviderAdapterResolver'

export class DefaultProviderAdapterResolver implements ProviderAdapterResolver {
  resolve(registry: ProviderAdapterRegistry, providerId: AdapterProviderId): DeterministicProviderAdapter | undefined {
    return registry.get(providerId)
  }

  resolveByCapability(registry: ProviderAdapterRegistry, capability: ProviderAdapterCapability): readonly DeterministicProviderAdapter[] {
    return registry.list().filter((adapter) => resolveProviderAdapterCapabilities(adapter.metadata).supported.includes(capability))
  }
}

export function createProviderAdapterResolver(): ProviderAdapterResolver {
  return new DefaultProviderAdapterResolver()
}
