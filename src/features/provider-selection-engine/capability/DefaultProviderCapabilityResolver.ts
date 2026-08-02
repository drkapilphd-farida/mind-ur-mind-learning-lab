import type { ProviderCatalogEntry, SelectionCapability } from '../types'
import type { ProviderCapabilityResolver } from './ProviderCapabilityResolver'

export class DefaultProviderCapabilityResolver implements ProviderCapabilityResolver {
  filterByCapability(entries: readonly ProviderCatalogEntry[], capability: SelectionCapability): readonly ProviderCatalogEntry[] {
    return entries.filter((entry) => entry.supportedCapabilities.includes(capability))
  }
}

export function createProviderCapabilityResolver(): ProviderCapabilityResolver {
  return new DefaultProviderCapabilityResolver()
}
