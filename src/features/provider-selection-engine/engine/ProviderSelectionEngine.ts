import type { ProviderSelectionOutcome, ProviderSelectionRequest } from '../types'

// One of the brief's own 9 named responsibilities — the top-level
// entry point applying "Selection Rules" (§ brief) over the registry.
// Never throws — see `ProviderSelectionOutcome`'s own header comment.
export interface ProviderSelectionEngine {
  select(request: ProviderSelectionRequest): ProviderSelectionOutcome
}
