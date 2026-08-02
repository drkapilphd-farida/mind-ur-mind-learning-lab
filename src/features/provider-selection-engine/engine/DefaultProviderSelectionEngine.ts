import type { ProviderSelectionRegistry } from '../registry'
import type { ProviderSelectionResolver } from '../resolution'
import type { ProviderSelectionOutcome, ProviderSelectionRequest } from '../types'
import type { ProviderSelectionEngine } from './ProviderSelectionEngine'

// "Selection Rules" (§ brief): try the strict default resolver first;
// if it finds nothing, try the relaxed fallback resolver; if that also
// finds nothing, the request is unresolvable — `resolutionPath: 'none'`,
// never a thrown exception. `resolutionPath: 'preferred'` marks the
// case where the caller's own `preferredProviderId` was actually
// honored, distinct from `'default'` (the engine picked on its own).
// Priority ordering itself lives inside `defaultResolver`/
// `fallbackResolver` (each already has its own injected
// `ProviderPriorityResolver`) — diagnostics that need the raw priority
// order compute it separately via `../diagnostics`, same "pure
// generator takes pre-computed pieces" pattern as every prior sprint's
// diagnostics module.
export class DefaultProviderSelectionEngine implements ProviderSelectionEngine {
  constructor(
    private readonly registry: ProviderSelectionRegistry,
    private readonly defaultResolver: ProviderSelectionResolver,
    private readonly fallbackResolver: ProviderSelectionResolver,
  ) {}

  select(request: ProviderSelectionRequest): ProviderSelectionOutcome {
    const candidates = this.registry.list()

    const defaultMatch = this.defaultResolver.resolve(candidates, request)
    if (defaultMatch) {
      const resolutionPath = request.preferredProviderId === defaultMatch.providerId ? 'preferred' : 'default'
      return {
        selectedProviderId: defaultMatch.providerId,
        resolutionPath,
        reason: resolutionPath === 'preferred' ? 'The preferred provider satisfied the request.' : 'The highest-priority usable provider satisfied the request.',
      }
    }

    const fallbackMatch = this.fallbackResolver.resolve(candidates, request)
    if (fallbackMatch) {
      return { selectedProviderId: fallbackMatch.providerId, resolutionPath: 'fallback', reason: 'No provider fully satisfied the request; falling back to any usable provider.' }
    }

    return { selectedProviderId: null, resolutionPath: 'none', reason: 'No registered provider is usable.' }
  }
}

export function createProviderSelectionEngine(
  registry: ProviderSelectionRegistry,
  defaultResolver: ProviderSelectionResolver,
  fallbackResolver: ProviderSelectionResolver,
): ProviderSelectionEngine {
  return new DefaultProviderSelectionEngine(registry, defaultResolver, fallbackResolver)
}
