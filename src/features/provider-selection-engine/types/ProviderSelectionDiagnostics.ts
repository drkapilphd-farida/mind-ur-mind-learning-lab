import type { ProviderSelectionValidation } from './ProviderSelectionValidation'
import type { SelectionCapability } from './SelectionCapability'
import type { SelectionProviderId } from './SelectionProviderId'

// Immutable — every field `readonly`. One of the brief's own 9 named
// responsibilities ("ProviderSelectionDiagnostics") — a full record of
// one selection decision.
export type ProviderSelectionDiagnostics = {
  readonly requestedCapability: SelectionCapability | null
  readonly preferredProviderId: string | null
  readonly candidateCount: number
  readonly priorityOrder: readonly SelectionProviderId[]
  readonly resolutionPath: 'preferred' | 'default' | 'fallback' | 'none'
  readonly selectedProviderId: SelectionProviderId | null
  readonly validationResult: ProviderSelectionValidation
}
