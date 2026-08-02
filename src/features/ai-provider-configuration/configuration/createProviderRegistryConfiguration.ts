import type { ProviderRegistryConfiguration } from '../types'
import type { EnvironmentConfigSource } from '../contracts'
import { SUPPORTED_PROVIDERS } from '../catalog'
import { createInMemoryEnvironmentConfigSource } from '../environment'

export type CreateProviderRegistryConfigurationInput = {
  environmentConfigSource?: EnvironmentConfigSource
}

// The "Provider Configuration System"'s own entry point — assembles a
// full ProviderRegistryConfiguration from the (injectable) Environment
// Configuration Layer + the static SUPPORTED_PROVIDERS catalog.
// Defaults to InMemoryEnvironmentConfigSource (deterministic, always
// 'mock') rather than ProcessEnvConfigSource — a caller that wants real
// env-driven configuration passes one in explicitly; nothing this
// sprint reads `process.env` by default.
export function createProviderRegistryConfiguration(input: CreateProviderRegistryConfigurationInput = {}): ProviderRegistryConfiguration {
  const environmentConfigSource = input.environmentConfigSource ?? createInMemoryEnvironmentConfigSource()

  return {
    activeProviderId: environmentConfigSource.getActiveProviderId(),
    providers: SUPPORTED_PROVIDERS,
    featureFlags: environmentConfigSource.getFeatureFlags(),
  }
}
