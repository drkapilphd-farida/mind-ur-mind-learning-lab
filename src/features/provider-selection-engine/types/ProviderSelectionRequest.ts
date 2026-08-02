import type { SelectionCapability } from './SelectionCapability'

// Immutable — every field `readonly`. The engine's own input — not
// named "ProviderSelectionCriteria" (the brief never names this type
// literally, only the criteria *dimensions* in prose) specifically to
// sidestep the real, pre-existing `ai-provider/types/ProviderSelectionCriteria.ts`
// (a different shape). `preferredProviderId`/`requiredModel` are plain
// `string` (not the closed `SelectionProviderId` union) — realistic,
// possibly-invalid external input, same posture as `provider-adapter-layer`'s
// own `ProviderAdapterFactory.create(providerId: string)`.
export type ProviderSelectionRequest = {
  readonly requestedCapability: SelectionCapability | null
  readonly preferredProviderId: string | null
  readonly requiredModel: string | null
}
