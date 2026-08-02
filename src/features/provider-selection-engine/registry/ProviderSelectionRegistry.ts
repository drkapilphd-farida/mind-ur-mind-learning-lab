import type { ProviderCatalogEntry, ProviderSelectionValidation } from '../types'

// The brief's own "ProviderRegistry" responsibility, renamed — a real,
// exact collision found via repo-wide grep with
// `ai-provider/contracts/ProviderRegistry.ts` (a different registry,
// storing real `AIProvider` instances). Renamed to echo this sprint's
// own brief title ("Provider Registry & Selection Engine"). `get`/`has`
// take a plain `string` (not the closed `SelectionProviderId` union) —
// realistic, possibly-invalid external lookup input, matching
// `provider-adapter-layer`'s own `ProviderAdapterFactory.create(providerId: string)`.
export interface ProviderSelectionRegistry {
  register(entry: ProviderCatalogEntry): ProviderSelectionValidation
  get(providerId: string): ProviderCatalogEntry | undefined
  list(): readonly ProviderCatalogEntry[]
  has(providerId: string): boolean
}
