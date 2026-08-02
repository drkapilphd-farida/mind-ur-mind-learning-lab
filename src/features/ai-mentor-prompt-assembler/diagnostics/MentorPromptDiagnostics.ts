// "Payload completeness, Section count, Validation status, Payload
// version" — the Sprint 30 brief's own Section 7 list, verbatim.
// Immutable — every field `readonly`.
export type MentorPromptDiagnostics = {
  readonly payloadCompleteness: 'complete' | 'partial' | 'empty'
  readonly sectionCount: number
  readonly validationStatus: 'valid' | 'invalid'
  readonly payloadVersion: number
}
