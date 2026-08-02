import type { ExecutionMetadata } from './ExecutionMetadata'
import type { ExecutionSequence } from './ExecutionSequence'

// Immutable — every field `readonly`. "Produce immutable output" — the
// whole Execution Planner's™ output, one plan per orchestration run.
export type PersonalizationExecutionPlan = {
  readonly id: string
  readonly version: number
  readonly sequences: readonly ExecutionSequence[]
  readonly metadata: ExecutionMetadata
}
