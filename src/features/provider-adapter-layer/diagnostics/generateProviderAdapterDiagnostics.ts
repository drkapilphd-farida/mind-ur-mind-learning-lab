import type {
  ProviderAdapterCapabilities,
  ProviderAdapterDiagnostics,
  ProviderAdapterMetadata,
  ProviderAdapterPayload,
  ProviderAdapterValidation,
} from '../types'

// Pure — "## Diagnostics" (§ brief): "Collect: Adapter Name, Provider,
// Adapter Version, Validation Result, Transformation Result,
// Capability Resolution, Normalization Status." `transformationResult`
// is `null` when the caller never reached the transform step (e.g. a
// request rejected during validation); `normalizationStatus` is a
// simple caller-supplied marker, never measured.
export function generateProviderAdapterDiagnostics(
  metadata: ProviderAdapterMetadata,
  validationResult: ProviderAdapterValidation,
  transformationResult: ProviderAdapterPayload | null,
  capabilityResolution: ProviderAdapterCapabilities,
  normalizationStatus: 'normalized' | 'not-normalized',
): ProviderAdapterDiagnostics {
  return {
    adapterName: metadata.providerName,
    providerId: metadata.providerId,
    adapterVersion: metadata.providerVersion,
    validationResult,
    transformationResult,
    capabilityResolution,
    normalizationStatus,
  }
}
