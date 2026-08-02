export type ReadingIntelligenceJourneyValidationIssueType =
  | 'queue-remaining-count-overflow'
  | 'mind-score-out-of-range'
  | 'non-negative-xp'
  | 'progress-count-overflow'

export type ReadingIntelligenceJourneyValidationIssue = {
  readonly type: ReadingIntelligenceJourneyValidationIssueType
  readonly detail: string
}
