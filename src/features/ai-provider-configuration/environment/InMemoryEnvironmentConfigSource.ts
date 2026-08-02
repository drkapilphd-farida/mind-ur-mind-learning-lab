import type { ActiveProviderId, ProviderFeatureFlags, SupportedProviderId } from '../types'
import type { EnvironmentConfigSource } from '../contracts'
import { SUPPORTED_PROVIDERS } from '../catalog'

function allDisabledFlags(): ProviderFeatureFlags {
  const flags = {} as { -readonly [K in SupportedProviderId]: boolean }
  for (const provider of SUPPORTED_PROVIDERS) flags[provider.id] = false
  return flags
}

export type InMemoryEnvironmentConfigSourceOptions = {
  activeProviderId?: ActiveProviderId
  featureFlags?: Partial<ProviderFeatureFlags>
}

// Implements EnvironmentConfigSource without touching `process.env` at
// all — the deterministic default for every test and for
// createDefaultProviderRegistryConfiguration's own default wiring.
// Always resolves to 'mock' with every flag `false` unless a caller
// explicitly overrides it, which is exactly "Current Mock Provider
// remains default."
export class InMemoryEnvironmentConfigSource implements EnvironmentConfigSource {
  private readonly activeProviderId: ActiveProviderId
  private readonly featureFlags: ProviderFeatureFlags

  constructor(options: InMemoryEnvironmentConfigSourceOptions = {}) {
    this.activeProviderId = options.activeProviderId ?? 'mock'
    this.featureFlags = { ...allDisabledFlags(), ...options.featureFlags }
  }

  getActiveProviderId(): ActiveProviderId {
    return this.activeProviderId
  }

  getFeatureFlags(): ProviderFeatureFlags {
    return this.featureFlags
  }
}

export function createInMemoryEnvironmentConfigSource(options: InMemoryEnvironmentConfigSourceOptions = {}): EnvironmentConfigSource {
  return new InMemoryEnvironmentConfigSource(options)
}
