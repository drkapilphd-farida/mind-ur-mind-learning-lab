import type { ModelCapability } from './ModelCapability'
import type { ModelSelectionValidation } from './ModelSelectionValidation'

// Immutable — every field `readonly`. One of the brief's own 10 named
// responsibilities ("ModelSelectionDiagnostics") — a full record of
// one selection decision.
export type ModelSelectionDiagnostics = {
  readonly providerId: string
  readonly requestedCapability: ModelCapability | null
  readonly preferredModelId: string | null
  readonly candidateCount: number
  readonly priorityOrder: readonly string[]
  readonly resolutionPath: 'preferred' | 'default' | 'fallback' | 'none'
  readonly selectedModelId: string | null
  readonly validationResult: ModelSelectionValidation
}
