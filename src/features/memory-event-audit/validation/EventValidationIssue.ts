// "Duplicate events, Invalid event transitions, Missing references,
// Event ordering" — the Sprint 18 brief's own four named validation
// checks (its fifth, "Audit integrity", is the overall result — see
// `EventValidationResult.ts`).
export type EventValidationIssueType = 'duplicate-event' | 'invalid-transition' | 'missing-reference' | 'ordering-violation'

// Immutable — every field `readonly`.
export type EventValidationIssue = {
  readonly type: EventValidationIssueType
  readonly detail: string
}
