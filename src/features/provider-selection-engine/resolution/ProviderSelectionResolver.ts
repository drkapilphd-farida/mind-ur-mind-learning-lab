import type { ProviderCatalogEntry, ProviderSelectionRequest } from '../types'

// A small, shared interface (not brief-named — the brief only names
// its two concrete implementations, `DefaultProviderSelectionResolver`
// and `FallbackProviderResolver`) so `ProviderSelectionEngine` can try
// one, then the other, uniformly.
export interface ProviderSelectionResolver {
  resolve(candidates: readonly ProviderCatalogEntry[], request: ProviderSelectionRequest): ProviderCatalogEntry | undefined
}
