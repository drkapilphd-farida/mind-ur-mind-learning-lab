import { createRuntimeProviderResolver } from '@/features/ai-provider-configuration/resolver'
import { SUPPORTED_PROVIDERS } from '@/features/ai-provider-configuration/catalog'
import { createProcessEnvConfigSource } from '@/features/ai-provider-configuration/environment'
import type { EnvironmentConfigSource } from '@/features/ai-provider-configuration/contracts'
import type { ProviderRegistryConfiguration } from '@/features/ai-provider-configuration/types'
import { createRealProviderRegistry } from '../registration'
import { createEnvProviderCredentialResolver } from '../credentials'
import { createConfiguredProviderHealthChecker } from '../health'
import { RuntimeProviderSwitcher } from './RuntimeProviderSwitcher'

const REAL_ADAPTER_PROVIDER_IDS = new Set(['openai', 'claude'])

// This sprint's own supported-providers list: identical to Sprint 6's
// SUPPORTED_PROVIDERS catalog except `enabled: true` for exactly the
// two providers this sprint built a real adapter for — every other
// entry (gemini, azure-openai, openrouter, ollama, custom) stays
// `enabled: false`, honestly, since no adapter exists for them yet.
// Sprint 6's own createProviderRegistryConfiguration() always keeps
// every entry disabled by design (documented as "until a real adapter
// exists") — this builds the ProviderRegistryConfiguration type
// directly instead, reusing Sprint 6's catalog data and
// EnvironmentConfigSource contract, without modifying Sprint 6's
// factory function itself.
function buildConfiguration(environmentConfigSource: EnvironmentConfigSource): ProviderRegistryConfiguration {
  return {
    activeProviderId: environmentConfigSource.getActiveProviderId(),
    providers: SUPPORTED_PROVIDERS.map((entry) => (REAL_ADAPTER_PROVIDER_IDS.has(entry.id) ? { ...entry, enabled: true } : entry)),
    featureFlags: environmentConfigSource.getFeatureFlags(),
  }
}

// The default, fully-real wiring: reads actual `process.env` (via
// Sprint 6's ProcessEnvConfigSource) for AI_ACTIVE_PROVIDER_ID /
// AI_PROVIDER_<ID>_ENABLED, checks real credential presence (via
// EnvProviderCredentialResolver), and only ever resolves to a real
// provider if every gate — enabled in this config, feature-flagged on,
// credentialed — passes. In development and test environments, none of
// those env vars are set, so this always resolves to 'mock' — "no real
// API requests should occur in development or tests" holds by
// construction, not by a special-cased check.
export function createDefaultRuntimeProviderSwitcher(): RuntimeProviderSwitcher {
  const { registry, adapters } = createRealProviderRegistry()
  const configuration = buildConfiguration(createProcessEnvConfigSource())
  const resolver = createRuntimeProviderResolver(configuration, {
    credentialResolver: createEnvProviderCredentialResolver(),
    healthChecker: createConfiguredProviderHealthChecker(),
  })

  return new RuntimeProviderSwitcher({ registry, adapters, resolver })
}
