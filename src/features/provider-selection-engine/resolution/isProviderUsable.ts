import type { ProviderCatalogEntry } from '../types'

// Pure — the one, shared "is this entry even usable right now" check
// both resolvers below apply first: fully `'available'` (not
// `'degraded'`/`'unavailable'`) and `configuration.enabled`.
export function isProviderUsable(entry: ProviderCatalogEntry): boolean {
  return entry.availability === 'available' && entry.configuration.enabled
}
