import type { ProviderCatalogEntry } from '../types'

// One of the brief's own 9 named responsibilities. Orders candidates
// by `priority` — lower number = more preferred.
export interface ProviderPriorityResolver {
  order(entries: readonly ProviderCatalogEntry[]): readonly ProviderCatalogEntry[]
}
