import type { AIModel, AIModelCapabilities } from '../types'
import type { AIProvider } from './AIProvider'

// Isolates "does this model/provider satisfy these capabilities" behind
// one contract, so nothing else — ProviderResolver, ProviderDiscovery,
// or a future caller — hardcodes its own capability-matching
// conditional. `resolution/` and `discovery/` both take this as an
// injected dependency rather than re-implementing the check.
export interface CapabilityResolver {
  supportsAll(model: AIModel, requiredCapabilities: readonly (keyof AIModelCapabilities)[]): boolean
  filterProvidersByCapabilities(providers: readonly AIProvider[], requiredCapabilities: readonly (keyof AIModelCapabilities)[]): readonly AIProvider[]
}
