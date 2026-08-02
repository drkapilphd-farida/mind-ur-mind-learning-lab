import type { AdapterProviderId } from './AdapterProviderId'
import type { ProviderAdapterCapabilities } from './ProviderAdapterCapabilities'
import type { ProviderAdapterPayload } from './ProviderAdapterPayload'
import type { ProviderAdapterValidation } from './ProviderAdapterValidation'

// Immutable — every field `readonly`. "## Diagnostics" (§ brief),
// verbatim: Adapter Name, Provider, Adapter Version, Validation Result,
// Transformation Result, Capability Resolution, Normalization Status.
// Type lives here in `types/`, generator lives in `../diagnostics/` —
// same deviation this whole session's own prior sprints (32-35) use.
export type ProviderAdapterDiagnostics = {
  readonly adapterName: string
  readonly providerId: AdapterProviderId
  readonly adapterVersion: string
  readonly validationResult: ProviderAdapterValidation
  readonly transformationResult: ProviderAdapterPayload | null
  readonly capabilityResolution: ProviderAdapterCapabilities
  readonly normalizationStatus: 'normalized' | 'not-normalized'
}
