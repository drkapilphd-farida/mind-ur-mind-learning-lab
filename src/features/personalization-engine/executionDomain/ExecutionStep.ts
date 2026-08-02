import type { ExecutionPriority } from './ExecutionPriority'
import type { ExecutionSequenceType } from './ExecutionSequenceType'

// Immutable — every field `readonly`. One executable unit within a
// sequence. `order` is 0-based and strictly increasing within its
// sequence — the deterministic position the Execution Orchestrator™
// checks in `executionValidation/`.
export type ExecutionStep = {
  readonly id: string
  readonly sequenceType: ExecutionSequenceType
  readonly referenceId: string
  readonly order: number
  readonly priority: ExecutionPriority
  readonly detail: string
}
