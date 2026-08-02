import type { ModelPriorityResolver } from '../priority'
import type { ModelCatalogEntry, ModelSelectionRequest } from '../types'
import { isModelUsable } from './isModelUsable'
import type { ModelSelectionResolver } from './ModelSelectionResolver'

// One of the brief's own 10 named responsibilities — no naming
// collision found, used brief-exact. Relaxed resolution — still scoped
// to `request.providerId` (this sprint never switches providers), but
// ignores `requestedCapability`/`minimumContextSize`/`preferredModelId`
// entirely: just the highest-priority usable model for that provider,
// a last resort "give me anything that works for this provider."
export class FallbackModelResolver implements ModelSelectionResolver {
  constructor(private readonly priorityResolver: ModelPriorityResolver) {}

  resolve(candidates: readonly ModelCatalogEntry[], request: ModelSelectionRequest): ModelCatalogEntry | undefined {
    const usable = candidates.filter((entry) => entry.metadata.providerId === request.providerId && isModelUsable(entry))
    const [firstByPriority] = this.priorityResolver.order(usable)
    return firstByPriority
  }
}

export function createFallbackModelResolver(priorityResolver: ModelPriorityResolver): ModelSelectionResolver {
  return new FallbackModelResolver(priorityResolver)
}
