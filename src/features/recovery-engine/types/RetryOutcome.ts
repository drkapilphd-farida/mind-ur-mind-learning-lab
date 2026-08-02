// Immutable — every field `readonly`. A deterministic, caller-supplied
// fact about what actually happened when a planned retry ran —
// `RetryExecutor` never performs a real retry itself.
export type RetryOutcome = {
  readonly succeeded: boolean
  readonly responseText: string | null
}
