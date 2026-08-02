import type { ModelCatalogEntry, ModelSelectionValidation } from '../types'

// One of the brief's own 10 named responsibilities — no naming
// collision found anywhere in the repo, used brief-exact.
// `listByProvider` is a small, real addition (not brief-named) —
// `../resolution/` needs to scope candidates to the already-selected
// provider before applying any other rule.
export interface ModelRegistry {
  register(entry: ModelCatalogEntry): ModelSelectionValidation
  get(modelId: string): ModelCatalogEntry | undefined
  list(): readonly ModelCatalogEntry[]
  listByProvider(providerId: string): readonly ModelCatalogEntry[]
  has(modelId: string): boolean
}
