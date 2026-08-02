// Immutable — every field `readonly`. A deterministic, caller-supplied
// fact about what actually happened when the request was executed —
// "the caller supplies the outcome, this engine only reacts," same
// determinism as `provider-execution-engine`'s own `attemptOutcomes`
// (Sprint 35). No real execution happens in this feature.
export type SessionExecutionOutcome = {
  readonly succeeded: boolean
  readonly responseText: string | null
  readonly failureReason: string | null
}
