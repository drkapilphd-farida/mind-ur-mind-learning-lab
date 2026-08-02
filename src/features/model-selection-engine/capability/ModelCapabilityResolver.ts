import type { ModelCapability, ModelCatalogEntry } from '../types'

// One of the brief's own 10 named responsibilities. Filters candidates
// down to those that declare a given capability.
export interface ModelCapabilityResolver {
  filterByCapability(entries: readonly ModelCatalogEntry[], capability: ModelCapability): readonly ModelCatalogEntry[]
}
