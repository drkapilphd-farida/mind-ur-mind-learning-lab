import type { SelectionProviderId } from './SelectionProviderId'

// Immutable — every field `readonly`. `ProviderSelectionEngine.select()`'s
// own output — never throws; an unresolvable request is representable
// as `resolutionPath: 'none'`, `selectedProviderId: null` data, not an
// exception.
export type ProviderSelectionOutcome = {
  readonly selectedProviderId: SelectionProviderId | null
  readonly resolutionPath: 'preferred' | 'default' | 'fallback' | 'none'
  readonly reason: string
}
