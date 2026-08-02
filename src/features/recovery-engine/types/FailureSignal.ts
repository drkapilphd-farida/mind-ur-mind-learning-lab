// Immutable — every field `readonly`. A deterministic, caller-supplied
// fact about why an attempt failed — never fetched, never measured —
// same "the caller supplies the fact" posture as
// `provider-execution-engine`'s own `attemptOutcomes` (Sprint 35).
export type FailureSignal = {
  readonly errorCode: string | null
  readonly timedOut: boolean
}
