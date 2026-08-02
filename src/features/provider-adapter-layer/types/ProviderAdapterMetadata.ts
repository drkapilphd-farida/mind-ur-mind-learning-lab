import type { AdapterProviderId } from './AdapterProviderId'
import type { ProviderAdapterCapability } from './ProviderAdapterCapability'
import type { ProviderAdapterConfiguration } from './ProviderAdapterConfiguration'

// Immutable — every field `readonly`. "## Adapter Metadata" (§ brief),
// verbatim: Provider Name, Provider Version, Supported Models, Maximum
// Context, Maximum Output, Supported Features, Default Configuration.
// One deterministic, hand-written value per provider — see
// `../definitions/PROVIDER_ADAPTER_DEFINITIONS.ts`.
export type ProviderAdapterMetadata = {
  readonly providerId: AdapterProviderId
  readonly providerName: string
  readonly providerVersion: string
  readonly supportedModels: readonly string[]
  readonly maximumContext: number
  readonly maximumOutput: number
  readonly supportedFeatures: readonly ProviderAdapterCapability[]
  readonly defaultConfiguration: ProviderAdapterConfiguration
}
