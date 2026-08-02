import { validateAdapterRegistration } from '../validation'
import type { AdapterProviderId, ProviderAdapterValidation } from '../types'
import type { DeterministicProviderAdapter } from './DeterministicProviderAdapter'
import type { ProviderAdapterRegistry } from './ProviderAdapterRegistry'

// In-memory adapter store, keyed by provider id — same "own, self-
// contained registry" discipline as every other DI-flavored class this
// session, deliberately not reusing `ai-provider`'s own live
// `InMemoryProviderRegistry`.
export class DefaultProviderAdapterRegistry implements ProviderAdapterRegistry {
  private readonly adapters = new Map<AdapterProviderId, DeterministicProviderAdapter>()

  register(adapter: DeterministicProviderAdapter): ProviderAdapterValidation {
    const validationResult = validateAdapterRegistration(Array.from(this.adapters.keys()), adapter.providerId)

    if (validationResult.valid) {
      this.adapters.set(adapter.providerId, adapter)
    }

    return validationResult
  }

  get(providerId: AdapterProviderId): DeterministicProviderAdapter | undefined {
    return this.adapters.get(providerId)
  }

  list(): readonly DeterministicProviderAdapter[] {
    return Array.from(this.adapters.values())
  }

  has(providerId: AdapterProviderId): boolean {
    return this.adapters.has(providerId)
  }
}

export function createProviderAdapterRegistry(): ProviderAdapterRegistry {
  return new DefaultProviderAdapterRegistry()
}
