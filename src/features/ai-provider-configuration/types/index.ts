// AI Provider Configuration™ domain types (Sprint 6). Same one-type-
// per-file convention as `@/features/ai-provider/types`. Reuses
// ai-provider's AIModelCapabilities/ProviderHealthStatus/
// ValidationResult directly where the concept is identical (see
// ModelRegistryEntry, contracts/ProviderHealthChecker) — a one-way,
// read-only dependency on Sprint 5, which this sprint never modifies.

export type { SupportedProviderId } from './SupportedProviderId'
export type { ActiveProviderId } from './ActiveProviderId'
export type { ProviderConfigEntry } from './ProviderConfigEntry'
export type { ModelRegistryEntry } from './ModelRegistryEntry'
export type { ProviderFeatureFlags } from './ProviderFeatureFlags'
export type { ProviderCapabilityMatrix } from './ProviderCapabilityMatrix'
export type { ProviderRegistryConfiguration } from './ProviderRegistryConfiguration'
