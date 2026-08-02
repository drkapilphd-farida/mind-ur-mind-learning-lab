import type { ExecutionSequenceType } from './ExecutionSequenceType'
import type { ExecutionStep } from './ExecutionStep'

// Immutable — every field `readonly`. One ordered group of steps of the
// same `type` — "Support deterministic sequencing" per sequence kind.
export type ExecutionSequence = {
  readonly type: ExecutionSequenceType
  readonly steps: readonly ExecutionStep[]
}
