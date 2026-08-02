import type { AIModel, AIModelCapabilities } from '../types'
import type { AIProvider, CapabilityResolver } from '../contracts'

// Implements CapabilityResolver. A provider "has" a capability if any
// one of its models declares it — a provider with both a chat-only and
// a vision model still counts as vision-capable, since ProviderResolver
// selects the *provider*, not a specific model, from this filter.
export class DefaultCapabilityResolver implements CapabilityResolver {
  supportsAll(model: AIModel, requiredCapabilities: readonly (keyof AIModelCapabilities)[]): boolean {
    return requiredCapabilities.every((capability) => model.capabilities[capability])
  }

  filterProvidersByCapabilities(providers: readonly AIProvider[], requiredCapabilities: readonly (keyof AIModelCapabilities)[]): readonly AIProvider[] {
    if (requiredCapabilities.length === 0) return providers
    return providers.filter((provider) => provider.models.some((model) => this.supportsAll(model, requiredCapabilities)))
  }
}

export function createCapabilityResolver(): CapabilityResolver {
  return new DefaultCapabilityResolver()
}
