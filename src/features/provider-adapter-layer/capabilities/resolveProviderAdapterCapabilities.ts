import type { ProviderAdapterCapabilities, ProviderAdapterMetadata } from '../types'

// Pure — "## Provider Capabilities" (§ brief): derives the capability
// bundle straight from a provider's own metadata. Capabilities are
// metadata only — this never checks whether a capability actually
// works, only what the catalog declares.
export function resolveProviderAdapterCapabilities(metadata: ProviderAdapterMetadata): ProviderAdapterCapabilities {
  return { providerId: metadata.providerId, supported: metadata.supportedFeatures }
}
