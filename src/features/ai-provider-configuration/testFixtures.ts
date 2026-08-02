// Shared test-only fixtures for this feature's own test suite — same
// convention as `@/features/ai-provider/testFixtures.ts`. Not itself a
// *.test.ts file, so vitest's `include` glob never picks it up as a
// test file.
import type { ProviderConfigEntry, ProviderFeatureFlags, ProviderRegistryConfiguration } from './types'
import { SUPPORTED_PROVIDERS } from './catalog'

export function makeAllDisabledFeatureFlags(overrides: Partial<ProviderFeatureFlags> = {}): ProviderFeatureFlags {
  const flags = {} as { -readonly [K in ProviderConfigEntry['id']]: boolean }
  for (const provider of SUPPORTED_PROVIDERS) flags[provider.id] = false
  return { ...flags, ...overrides }
}

export function makeProviderRegistryConfiguration(overrides: Partial<ProviderRegistryConfiguration> = {}): ProviderRegistryConfiguration {
  return {
    activeProviderId: 'mock',
    providers: SUPPORTED_PROVIDERS,
    featureFlags: makeAllDisabledFeatureFlags(),
    ...overrides,
  }
}
