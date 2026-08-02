import type { ExecutionBackoffStrategy } from './ExecutionBackoffStrategy'
import type { ExecutionState } from './ExecutionState'

// Renamed from the brief's own literal "ExecutionDiagnostics" — that
// exact name already exists at
// `@/features/personalization-engine/executionDiagnostics/ExecutionDiagnostics.ts`
// (Sprint 25, execution-*plan* diagnostics, an unrelated concept), and
// the natural alternative `ProviderExecutionDiagnostics` is *also*
// already taken (Sprint 32's own request-completeness diagnostics) —
// renaming to that would be a second collision. Renamed to
// `ExecutionRuntimeDiagnostics`, echoing the brief's own closing
// language ("complete the Execution Runtime of your AI architecture").
// "Execution Id, Provider, Strategy, Attempt Count, Start State, End
// State, Failure Reason, Cancellation Reason, Timeout Reason, Elapsed
// Metadata" — the brief's own Execution Diagnostics list, verbatim.
// `elapsedMetadata` is a deterministic list of stage-transition
// markers (e.g. `'pending->preparing'`) — "No real timestamps
// required." Immutable — every field `readonly`.
export type ExecutionRuntimeDiagnostics = {
  readonly executionId: string
  readonly providerId: string
  readonly strategy: ExecutionBackoffStrategy
  readonly attemptCount: number
  readonly startState: ExecutionState
  readonly endState: ExecutionState
  readonly failureReason: string | null
  readonly cancellationReason: string | null
  readonly timeoutReason: string | null
  readonly elapsedMetadata: readonly string[]
}
