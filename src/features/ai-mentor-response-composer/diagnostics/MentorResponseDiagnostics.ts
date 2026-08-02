// "Response completeness, Section count, Validation status, Response
// version" — the Sprint 29 brief's own Section 7 list, verbatim.
// Immutable — every field `readonly`.
export type MentorResponseDiagnostics = {
  readonly responseCompleteness: 'complete' | 'partial' | 'empty'
  readonly sectionCount: number
  readonly validationStatus: 'valid' | 'invalid'
  readonly responseVersion: number
}
