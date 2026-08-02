import type { AIModelCapabilities } from '../types'
import type { AIProvider, ProviderRegistry } from '../contracts'

// Implements ProviderRegistry. Fully in-memory — no database, per
// this sprint's explicit scope. `register()` overwrites any existing
// entry with the same providerId rather than throwing, so
// re-registering (e.g. hot-reloading configuration) is always safe.
export class InMemoryProviderRegistry implements ProviderRegistry {
  private readonly providers = new Map<string, AIProvider>()

  register(provider: AIProvider): void {
    this.providers.set(provider.metadata.id, provider)
  }

  unregister(providerId: string): void {
    this.providers.delete(providerId)
  }

  get(providerId: string): AIProvider | undefined {
    return this.providers.get(providerId)
  }

  list(): readonly AIProvider[] {
    return [...this.providers.values()]
  }

  findByCapability(capability: keyof AIModelCapabilities): readonly AIProvider[] {
    return this.list().filter((provider) => provider.models.some((model) => model.capabilities[capability]))
  }
}

export function createProviderRegistry(): ProviderRegistry {
  return new InMemoryProviderRegistry()
}
