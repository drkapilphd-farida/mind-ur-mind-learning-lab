import type { ActiveProviderId, ProviderRegistryConfiguration } from '../types'
import type { ProviderSelectionPolicy } from '../contracts'

// Implements ProviderSelectionPolicy. 'mock' short-circuits
// immediately; a requested real provider must both have a `providers`
// entry with `enabled: true` AND its featureFlags entry `true` — either
// missing falls back to 'mock', never throws (an unconfigured
// activeProviderId is a normal, expected state this early, not an
// error — DefaultProviderConfigValidator is the layer that flags a
// genuinely malformed configuration).
export class DefaultProviderSelectionPolicy implements ProviderSelectionPolicy {
  selectActiveProviderId(config: ProviderRegistryConfiguration): ActiveProviderId {
    if (config.activeProviderId === 'mock') return 'mock'

    const entry = config.providers.find((provider) => provider.id === config.activeProviderId)
    if (!entry || !entry.enabled) return 'mock'
    if (!config.featureFlags[config.activeProviderId]) return 'mock'

    return config.activeProviderId
  }
}

export function createProviderSelectionPolicy(): ProviderSelectionPolicy {
  return new DefaultProviderSelectionPolicy()
}
