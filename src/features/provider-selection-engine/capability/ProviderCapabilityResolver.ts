import type { ProviderCatalogEntry, SelectionCapability } from '../types'

// One of the brief's own 9 named responsibilities. Filters candidates
// down to those that declare a given capability.
export interface ProviderCapabilityResolver {
  filterByCapability(entries: readonly ProviderCatalogEntry[], capability: SelectionCapability): readonly ProviderCatalogEntry[]
}
