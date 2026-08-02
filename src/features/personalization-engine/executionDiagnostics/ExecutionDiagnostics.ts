// "Total steps, Journey count, Session count, Validation status, Plan
// version" — the Sprint 25 brief's own Section 7 list, verbatim.
// Immutable — every field `readonly`.
export type ExecutionDiagnostics = {
  readonly totalSteps: number
  readonly journeyCount: number
  readonly sessionCount: number
  readonly validationStatus: 'valid' | 'invalid'
  readonly planVersion: number
}
