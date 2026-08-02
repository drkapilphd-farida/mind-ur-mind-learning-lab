import type { ProviderSelectionCriteria } from '../types'
import type { AIProvider, CapabilityResolver, ProviderResolver } from '../contracts'
import { NoMatchingProviderError } from './NoMatchingProviderError'

function hasModel(provider: AIProvider, modelId: string | undefined): boolean {
  return modelId !== undefined && provider.models.some((model) => model.id === modelId)
}

// Implements ProviderResolver — the exact same selection order Chunk 1's
// DefaultProviderFactory used inline, now a standalone, independently
// testable algorithm: (1) filter candidates by requiredCapabilities via
// the injected CapabilityResolver; (2) prefer a candidate with
// preferredModelId; (3) otherwise fallbackModelId; (4) otherwise the
// first remaining candidate; (5) otherwise throw. `maxCostCentsPerRequest`
// is accepted on the criteria type but not yet filtered on — see
// ProviderSelectionCriteria's own header comment for why.
export class DefaultProviderResolver implements ProviderResolver {
  constructor(private readonly capabilityResolver: CapabilityResolver) {}

  resolve(candidates: readonly AIProvider[], criteria: ProviderSelectionCriteria): AIProvider {
    const withCapabilities =
      criteria.requiredCapabilities && criteria.requiredCapabilities.length > 0
        ? this.capabilityResolver.filterProvidersByCapabilities(candidates, criteria.requiredCapabilities)
        : candidates

    const preferredMatch = criteria.preferredModelId ? withCapabilities.find((provider) => hasModel(provider, criteria.preferredModelId)) : undefined
    if (preferredMatch) return preferredMatch

    const fallbackMatch = criteria.fallbackModelId ? withCapabilities.find((provider) => hasModel(provider, criteria.fallbackModelId)) : undefined
    if (fallbackMatch) return fallbackMatch

    const [firstCandidate] = withCapabilities
    if (!firstCandidate) throw new NoMatchingProviderError(criteria)
    return firstCandidate
  }
}

export function createProviderResolver(capabilityResolver: CapabilityResolver): ProviderResolver {
  return new DefaultProviderResolver(capabilityResolver)
}
