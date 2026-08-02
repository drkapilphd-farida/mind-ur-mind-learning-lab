import type { ReadingIntelligenceJourneyValidationIssue } from './ReadingIntelligenceJourneyValidationIssue'

export type ReadingIntelligenceJourneyValidation = {
  readonly valid: boolean
  readonly issues: readonly ReadingIntelligenceJourneyValidationIssue[]
}
