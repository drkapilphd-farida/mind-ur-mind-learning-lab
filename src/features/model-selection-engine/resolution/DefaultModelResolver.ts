import type { ModelCapabilityResolver } from '../capability'
import type { ModelPriorityResolver } from '../priority'
import type { ModelCatalogEntry, ModelSelectionRequest } from '../types'
import { isModelUsable } from './isModelUsable'
import type { ModelSelectionResolver } from './ModelSelectionResolver'

// One of the brief's own 10 named responsibilities — no naming
// collision found, used brief-exact. Strict resolution, scoped to the
// already-selected provider only (this sprint picks a model *for* a
// provider, it never switches providers — that's
// `provider-selection-engine`'s job): (1) candidates for
// `request.providerId` only; (2) usable ones only; (3) filter by
// `requestedCapability` via the injected `ModelCapabilityResolver`, if
// given; (4) filter by `minimumContextSize`, if given; (5) if
// `preferredModelId` matches a survivor, return it; (6) otherwise the
// highest-priority survivor via the injected `ModelPriorityResolver`;
// (7) otherwise `undefined` — never throws.
export class DefaultModelResolver implements ModelSelectionResolver {
  constructor(
    private readonly capabilityResolver: ModelCapabilityResolver,
    private readonly priorityResolver: ModelPriorityResolver,
  ) {}

  resolve(candidates: readonly ModelCatalogEntry[], request: ModelSelectionRequest): ModelCatalogEntry | undefined {
    let usable: readonly ModelCatalogEntry[] = candidates.filter((entry) => entry.metadata.providerId === request.providerId && isModelUsable(entry))

    if (request.requestedCapability) {
      usable = this.capabilityResolver.filterByCapability(usable, request.requestedCapability)
    }

    if (request.minimumContextSize !== null) {
      usable = usable.filter((entry) => entry.metadata.contextSize >= (request.minimumContextSize as number))
    }

    if (request.preferredModelId) {
      const preferredMatch = usable.find((entry) => entry.metadata.id === request.preferredModelId)
      if (preferredMatch) return preferredMatch
    }

    const [firstByPriority] = this.priorityResolver.order(usable)
    return firstByPriority
  }
}

export function createDefaultModelResolver(capabilityResolver: ModelCapabilityResolver, priorityResolver: ModelPriorityResolver): ModelSelectionResolver {
  return new DefaultModelResolver(capabilityResolver, priorityResolver)
}
