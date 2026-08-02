import { validateProviderRegistration } from '../validation'
import type { ProviderCatalogEntry, ProviderSelectionValidation, SelectionProviderId } from '../types'
import type { ProviderSelectionRegistry } from './ProviderSelectionRegistry'

// In-memory catalog-entry store, keyed by provider id — same
// "self-contained registry" discipline as
// `provider-adapter-layer/orchestration/DefaultProviderAdapterRegistry.ts`,
// deliberately not reusing `ai-provider`'s own live `InMemoryProviderRegistry`.
export class DefaultProviderSelectionRegistry implements ProviderSelectionRegistry {
  private readonly entries = new Map<SelectionProviderId, ProviderCatalogEntry>()

  register(entry: ProviderCatalogEntry): ProviderSelectionValidation {
    const validationResult = validateProviderRegistration(Array.from(this.entries.keys()), entry.providerId)

    if (validationResult.valid) {
      this.entries.set(entry.providerId, entry)
    }

    return validationResult
  }

  get(providerId: string): ProviderCatalogEntry | undefined {
    return this.entries.get(providerId as SelectionProviderId)
  }

  list(): readonly ProviderCatalogEntry[] {
    return Array.from(this.entries.values())
  }

  has(providerId: string): boolean {
    return this.entries.has(providerId as SelectionProviderId)
  }
}

export function createProviderSelectionRegistry(): ProviderSelectionRegistry {
  return new DefaultProviderSelectionRegistry()
}
