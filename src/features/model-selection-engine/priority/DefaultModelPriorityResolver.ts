import type { ModelCatalogEntry } from '../types'
import type { ModelPriorityResolver } from './ModelPriorityResolver'

export class DefaultModelPriorityResolver implements ModelPriorityResolver {
  order(entries: readonly ModelCatalogEntry[]): readonly ModelCatalogEntry[] {
    return [...entries].sort((a, b) => a.priority - b.priority)
  }
}

export function createModelPriorityResolver(): ModelPriorityResolver {
  return new DefaultModelPriorityResolver()
}
