import type { ProviderSelectionCriteria } from '../types'
import type { AIProvider, ProviderFactory, ProviderRegistry, ProviderResolver } from '../contracts'
import { createCapabilityResolver } from '../capabilities'
import { createProviderResolver } from '../resolution'

export type ProviderFactoryDependencies = {
  resolver: ProviderResolver
}

function createDefaultDependencies(): ProviderFactoryDependencies {
  return { resolver: createProviderResolver(createCapabilityResolver()) }
}

// Implements ProviderFactory. Chunk 2: the selection algorithm itself
// moved to resolution/DefaultProviderResolver — this class now only
// owns fetching candidates from the registry (narrowing to
// criteria.providerId, if given) and delegates the actual pick to the
// injected ProviderResolver. That resolver is swappable via
// `overrides` (dependency injection), same convention as every other
// feature in this codebase — nothing here hardcodes "if provider ===
// X" ever again.
export class DefaultProviderFactory implements ProviderFactory {
  private readonly resolver: ProviderResolver

  constructor(
    private readonly registry: ProviderRegistry,
    dependencies: ProviderFactoryDependencies = createDefaultDependencies(),
  ) {
    this.resolver = dependencies.resolver
  }

  resolve(criteria: ProviderSelectionCriteria): AIProvider {
    const candidates = this.candidatesFor(criteria)
    return this.resolver.resolve(candidates, criteria)
  }

  private candidatesFor(criteria: ProviderSelectionCriteria): readonly AIProvider[] {
    if (!criteria.providerId) return this.registry.list()
    const provider = this.registry.get(criteria.providerId)
    return provider ? [provider] : []
  }
}

export function createProviderFactory(registry: ProviderRegistry, overrides: Partial<ProviderFactoryDependencies> = {}): ProviderFactory {
  return new DefaultProviderFactory(registry, { ...createDefaultDependencies(), ...overrides })
}
