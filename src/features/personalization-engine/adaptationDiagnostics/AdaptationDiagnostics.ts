// "Evaluated rules, Applied adaptations, Rejected adaptations,
// Validation status, Adaptation version" — the Sprint 27 brief's own
// Section 7 list, verbatim. Immutable — every field `readonly`.
export type AdaptationDiagnostics = {
  readonly evaluatedRules: number
  readonly appliedAdaptations: number
  readonly rejectedAdaptations: number
  readonly validationStatus: 'valid' | 'invalid'
  readonly adaptationVersion: number
}
