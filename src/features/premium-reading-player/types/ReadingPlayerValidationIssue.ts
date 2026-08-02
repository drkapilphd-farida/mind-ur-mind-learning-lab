export type ReadingPlayerValidationIssueType =
  | 'reading-score-out-of-range'
  | 'mind-score-out-of-range'
  | 'non-negative-xp'

export type ReadingPlayerValidationIssue = {
  readonly type: ReadingPlayerValidationIssueType
  readonly detail: string
}
