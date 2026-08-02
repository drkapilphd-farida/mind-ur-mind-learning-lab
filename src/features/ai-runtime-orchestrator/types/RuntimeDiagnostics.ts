import type { RuntimeState } from './RuntimeState'
import type { RuntimeValidation } from './RuntimeValidation'

// Immutable — every field `readonly`. One of the brief's own 10 named
// responsibilities — no naming collision found, used brief-exact.
export type RuntimeDiagnostics = {
  readonly learnerId: string
  readonly profileId: string
  readonly finalState: RuntimeState
  readonly completedStages: readonly RuntimeState[]
  readonly validationResult: RuntimeValidation
  readonly selectedProviderId: string | null
  readonly selectedModelId: string | null
}
