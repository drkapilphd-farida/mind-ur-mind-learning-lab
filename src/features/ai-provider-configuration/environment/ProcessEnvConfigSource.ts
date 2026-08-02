import type { ActiveProviderId, ProviderFeatureFlags, SupportedProviderId } from '../types'
import type { EnvironmentConfigSource } from '../contracts'
import { SUPPORTED_PROVIDERS } from '../catalog'

const ACTIVE_PROVIDER_ENV_VAR = 'AI_ACTIVE_PROVIDER_ID'

function featureFlagEnvVarName(providerId: SupportedProviderId): string {
  return `AI_PROVIDER_${providerId.toUpperCase().replace(/-/g, '_')}_ENABLED`
}

function isActiveProviderId(value: string | undefined): value is ActiveProviderId {
  if (value === undefined) return false
  if (value === 'mock') return true
  return SUPPORTED_PROVIDERS.some((provider) => provider.id === value)
}

// The real "Environment Configuration Layer" implementation — reads
// only two kinds of non-secret, server-side environment variables:
// which provider id is requested (AI_ACTIVE_PROVIDER_ID) and whether
// each supported provider is feature-flagged on
// (AI_PROVIDER_<ID>_ENABLED=true). Never reads, stores, or forwards
// anything key/credential-shaped — "No API keys" holds even for the
// one piece of this sprint that does touch `process.env`. Any
// unset/malformed value degrades safely to 'mock' / `false`, so a
// misconfigured deployment can never accidentally enable a real
// provider.
export class ProcessEnvConfigSource implements EnvironmentConfigSource {
  getActiveProviderId(): ActiveProviderId {
    const raw = process.env[ACTIVE_PROVIDER_ENV_VAR]
    return isActiveProviderId(raw) ? raw : 'mock'
  }

  getFeatureFlags(): ProviderFeatureFlags {
    const flags = {} as { -readonly [K in SupportedProviderId]: boolean }
    for (const provider of SUPPORTED_PROVIDERS) {
      flags[provider.id] = process.env[featureFlagEnvVarName(provider.id)] === 'true'
    }
    return flags
  }
}

export function createProcessEnvConfigSource(): EnvironmentConfigSource {
  return new ProcessEnvConfigSource()
}
