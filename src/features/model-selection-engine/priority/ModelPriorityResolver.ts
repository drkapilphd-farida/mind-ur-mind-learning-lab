import type { ModelCatalogEntry } from '../types'

// One of the brief's own 10 named responsibilities. Orders candidates
// by `priority` — lower number = more preferred.
export interface ModelPriorityResolver {
  order(entries: readonly ModelCatalogEntry[]): readonly ModelCatalogEntry[]
}
