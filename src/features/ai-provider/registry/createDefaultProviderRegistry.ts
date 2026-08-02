import { ALL_PROVIDERS } from '../providers'
import type { ProviderRegistry } from '../contracts'
import { createProviderRegistry } from './InMemoryProviderRegistry'

// A convenience factory — a registry pre-populated with all eight mock
// providers from `providers/`. `createProviderRegistry()` itself stays
// empty by default (a registry shouldn't assume what's registered in
// it); this is the "batteries included" variant for callers that just
// want the full catalog available immediately.
export function createDefaultProviderRegistry(): ProviderRegistry {
  const registry = createProviderRegistry()
  for (const provider of ALL_PROVIDERS) registry.register(provider)
  return registry
}
