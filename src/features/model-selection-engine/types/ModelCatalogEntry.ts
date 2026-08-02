import type { ModelAvailabilityState } from './ModelAvailabilityState'
import type { ModelMetadata } from './ModelMetadata'
import type { ModelSelectionConfiguration } from './ModelSelectionConfiguration'

// Immutable — every field `readonly`. One catalog/registry entry per
// model — the registry/selection wrapper around `ModelMetadata`,
// bundling every "Support deterministic selection using" (§ brief)
// dimension except "Selected Provider"/"Requested Capability"/
// "Preferred Model" (those come from the caller's own
// `ModelSelectionRequest`). `priority`: lower number = more preferred
// (same convention as `provider-selection-engine`).
export type ModelCatalogEntry = {
  readonly metadata: ModelMetadata
  readonly priority: number
  readonly availability: ModelAvailabilityState
  readonly configuration: ModelSelectionConfiguration
}
