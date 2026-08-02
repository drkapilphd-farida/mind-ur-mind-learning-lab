// Renamed from the brief's own literal "CancellationPolicy" for family
// consistency with `ExecutionRetryPolicy`'s own collision-driven
// rename (see that file's comment).
export type ExecutionCancellationPolicy = {
  readonly allowManualCancellation: boolean
  readonly allowSafetyCancellation: boolean
}
