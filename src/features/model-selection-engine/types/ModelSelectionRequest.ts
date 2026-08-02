import type { ModelCapability } from './ModelCapability'

// Immutable — every field `readonly`. The engine's own input.
// `providerId` is the "Selected Provider" dimension (§ brief) — a
// model has already been chosen for one provider upstream; both
// resolvers scope candidates to this provider only. `preferredModelId`
// is a plain `string` (not a closed union — model ids are open-ended,
// unlike the small, fixed provider set).
export type ModelSelectionRequest = {
  readonly providerId: string
  readonly requestedCapability: ModelCapability | null
  readonly preferredModelId: string | null
  readonly minimumContextSize: number | null
}
