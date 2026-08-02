import type { ProviderCatalogEntry } from '../types'
import type { ProviderPriorityResolver } from './ProviderPriorityResolver'

export class DefaultProviderPriorityResolver implements ProviderPriorityResolver {
  order(entries: readonly ProviderCatalogEntry[]): readonly ProviderCatalogEntry[] {
    return [...entries].sort((a, b) => a.priority - b.priority)
  }
}

export function createProviderPriorityResolver(): ProviderPriorityResolver {
  return new DefaultProviderPriorityResolver()
}
