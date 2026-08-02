import type { AIModel, AIModelCapabilities, ProviderMetadata } from '../types'
import type { AIProvider, ProviderDiscovery, ProviderRegistry } from '../contracts'

// Implements ProviderDiscovery as a thin, read-only view over a
// ProviderRegistry — every method here is derived from
// `registry.list()`, nothing is separately stored, so discovery can
// never drift out of sync with what's actually registered.
export class DefaultProviderDiscovery implements ProviderDiscovery {
  constructor(private readonly registry: ProviderRegistry) {}

  listProviderMetadata(): readonly ProviderMetadata[] {
    return this.registry.list().map((provider) => provider.metadata)
  }

  listAllModels(): readonly AIModel[] {
    return this.registry.list().flatMap((provider) => provider.models)
  }

  findModelsByCapability(capability: keyof AIModelCapabilities): readonly AIModel[] {
    return this.listAllModels().filter((model) => model.capabilities[capability])
  }

  findProviderForModel(modelId: string): AIProvider | undefined {
    return this.registry.list().find((provider) => provider.models.some((model) => model.id === modelId))
  }
}

export function createProviderDiscovery(registry: ProviderRegistry): ProviderDiscovery {
  return new DefaultProviderDiscovery(registry)
}
