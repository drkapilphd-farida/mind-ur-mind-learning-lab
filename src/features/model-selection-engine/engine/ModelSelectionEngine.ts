import type { ModelSelectionOutcome, ModelSelectionRequest } from '../types'

// One of the brief's own 10 named responsibilities — the top-level
// entry point applying "Selection Rules" (§ brief) over the registry.
// Never throws — see `ModelSelectionOutcome`'s own header comment.
export interface ModelSelectionEngine {
  select(request: ModelSelectionRequest): ModelSelectionOutcome
}
