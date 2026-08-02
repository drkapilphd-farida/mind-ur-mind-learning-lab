// "Context completeness, Recommendation count, Validation status,
// Assembly version" — the Sprint 28 brief's own Section 7 list,
// verbatim. Immutable — every field `readonly`.
export type MentorContextDiagnostics = {
  readonly contextCompleteness: 'complete' | 'partial' | 'empty'
  readonly recommendationCount: number
  readonly validationStatus: 'valid' | 'invalid'
  readonly assemblyVersion: number
}
