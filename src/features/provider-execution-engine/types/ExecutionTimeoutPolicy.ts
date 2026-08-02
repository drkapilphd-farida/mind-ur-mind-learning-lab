// Renamed from the brief's own literal "TimeoutPolicy" for family
// consistency with `ExecutionRetryPolicy`'s own collision-driven
// rename (see that file's comment). "Execution Deadline" (§ Timeout
// Engine).
export type ExecutionTimeoutPolicy = {
  readonly deadlineMs: number
}
