import type { ProviderPriorityResolver } from '../priority'
import type { ProviderCatalogEntry, ProviderSelectionRequest } from '../types'
import { isProviderUsable } from './isProviderUsable'
import type { ProviderSelectionResolver } from './ProviderSelectionResolver'

// The brief's own exact, uncolliding "FallbackProviderResolver" name.
// Relaxed resolution — ignores `requestedCapability`/`requiredModel`/
// `preferredProviderId` entirely: just the highest-priority usable
// candidate, a last resort "give me anything that works." Mirrors
// `ai-provider-configuration`'s own real `DefaultProviderSelectionPolicy`
// precedent of always having a safe fallback rather than ever leaving
// the caller with nothing but an exception.
export class FallbackProviderResolver implements ProviderSelectionResolver {
  constructor(private readonly priorityResolver: ProviderPriorityResolver) {}

  resolve(candidates: readonly ProviderCatalogEntry[], _request: ProviderSelectionRequest): ProviderCatalogEntry | undefined {
    const usable = candidates.filter(isProviderUsable)
    const [firstByPriority] = this.priorityResolver.order(usable)
    return firstByPriority
  }
}

export function createFallbackProviderResolver(priorityResolver: ProviderPriorityResolver): ProviderSelectionResolver {
  return new FallbackProviderResolver(priorityResolver)
}
