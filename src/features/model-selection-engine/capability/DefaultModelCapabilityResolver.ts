import type { ModelCapability, ModelCatalogEntry } from '../types'
import type { ModelCapabilityResolver } from './ModelCapabilityResolver'

export class DefaultModelCapabilityResolver implements ModelCapabilityResolver {
  filterByCapability(entries: readonly ModelCatalogEntry[], capability: ModelCapability): readonly ModelCatalogEntry[] {
    return entries.filter((entry) => entry.metadata.supportedCapabilities.includes(capability))
  }
}

export function createModelCapabilityResolver(): ModelCapabilityResolver {
  return new DefaultModelCapabilityResolver()
}
