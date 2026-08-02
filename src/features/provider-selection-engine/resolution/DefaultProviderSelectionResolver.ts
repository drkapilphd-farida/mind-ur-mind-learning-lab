import type { ProviderCapabilityResolver } from '../capability'
import type { ProviderPriorityResolver } from '../priority'
import type { ProviderCatalogEntry, ProviderSelectionRequest } from '../types'
import { isProviderUsable } from './isProviderUsable'
import type { ProviderSelectionResolver } from './ProviderSelectionResolver'

// The brief's own "DefaultProviderResolver" responsibility, renamed —
// a real, exact collision found via repo-wide grep with
// `ai-provider/resolution/DefaultProviderResolver.ts` (a different
// resolver, working over `AIProvider`/`ProviderSelectionCriteria`).
// Strict resolution — mirrors that same real file's own precedent of
// taking a `CapabilityResolver` as a constructor dependency: (1) usable
// candidates only; (2) filter by `requestedCapability` via the
// injected `ProviderCapabilityResolver`, if given; (3) filter by
// `requiredModel`, if given; (4) if `preferredProviderId` matches a
// survivor, return it; (5) otherwise the highest-priority survivor via
// the injected `ProviderPriorityResolver`; (6) otherwise `undefined` —
// never throws.
export class DefaultProviderSelectionResolver implements ProviderSelectionResolver {
  constructor(
    private readonly capabilityResolver: ProviderCapabilityResolver,
    private readonly priorityResolver: ProviderPriorityResolver,
  ) {}

  resolve(candidates: readonly ProviderCatalogEntry[], request: ProviderSelectionRequest): ProviderCatalogEntry | undefined {
    let usable: readonly ProviderCatalogEntry[] = candidates.filter(isProviderUsable)

    if (request.requestedCapability) {
      usable = this.capabilityResolver.filterByCapability(usable, request.requestedCapability)
    }

    if (request.requiredModel) {
      usable = usable.filter((entry) => entry.supportedModels.includes(request.requiredModel as string))
    }

    if (request.preferredProviderId) {
      const preferredMatch = usable.find((entry) => entry.providerId === request.preferredProviderId)
      if (preferredMatch) return preferredMatch
    }

    const [firstByPriority] = this.priorityResolver.order(usable)
    return firstByPriority
  }
}

export function createDefaultProviderSelectionResolver(
  capabilityResolver: ProviderCapabilityResolver,
  priorityResolver: ProviderPriorityResolver,
): ProviderSelectionResolver {
  return new DefaultProviderSelectionResolver(capabilityResolver, priorityResolver)
}
