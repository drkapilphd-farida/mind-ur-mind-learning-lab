import type { DeterministicProviderAdapter } from './DeterministicProviderAdapter'

// "## Factory" (§ brief): "Implement deterministic factory selection.
// Input: Provider Name. Output: Matching Provider Adapter. No dynamic
// loading. No reflection. No dependency injection framework." `create`
// takes a plain `string` (not `AdapterProviderId`) since a provider
// name is, in practice, untrusted input (e.g. config-driven) that may
// not name a known provider at all — see `ProviderAdapterException`.
export interface ProviderAdapterFactory {
  create(providerId: string): DeterministicProviderAdapter
}
