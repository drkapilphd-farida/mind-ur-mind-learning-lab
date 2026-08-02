import type { ModelCatalogEntry, ModelSelectionRequest } from '../types'

// A small, shared interface (not brief-named — the brief only names
// its two concrete implementations, `DefaultModelResolver` and
// `FallbackModelResolver`) so `ModelSelectionEngine` can try one, then
// the other, uniformly.
export interface ModelSelectionResolver {
  resolve(candidates: readonly ModelCatalogEntry[], request: ModelSelectionRequest): ModelCatalogEntry | undefined
}
