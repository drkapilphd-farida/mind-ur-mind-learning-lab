// Internal-consistency checks on the *composed* result only — the real data
// this feature builds from is already validated/guaranteed by its own
// source systems (getModuleProgress, getExerciseAccess, etc.), so this is
// deliberately a small set, not a re-validation of upstream data.
export type ReadingIntelligenceValidationIssueType =
  | 'non-negative-xp'
  | 'progress-count-overflow'
  | 'mind-score-out-of-range'

export type ReadingIntelligenceValidationIssue = {
  readonly type: ReadingIntelligenceValidationIssueType
  readonly detail: string
}
