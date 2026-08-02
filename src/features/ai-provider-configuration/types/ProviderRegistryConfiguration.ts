import type { ActiveProviderId } from './ActiveProviderId'
import type { ProviderConfigEntry } from './ProviderConfigEntry'
import type { ProviderFeatureFlags } from './ProviderFeatureFlags'

// The "Provider Configuration System"'s top-level, whole-system
// snapshot — everything RuntimeProviderResolver needs to decide which
// provider is actually active. `activeProviderId` is the *requested*
// provider (from configuration/environment); the resolver may still
// fall back to 'mock' at runtime (health, credentials, validation) —
// this type only records intent, not the final decision.
export type ProviderRegistryConfiguration = {
  activeProviderId: ActiveProviderId
  providers: readonly ProviderConfigEntry[]
  featureFlags: ProviderFeatureFlags
}
