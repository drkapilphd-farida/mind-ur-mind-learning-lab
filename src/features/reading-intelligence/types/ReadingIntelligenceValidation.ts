import type { ReadingIntelligenceValidationIssue } from './ReadingIntelligenceValidationIssue'

export type ReadingIntelligenceValidation = {
  readonly valid: boolean
  readonly issues: readonly ReadingIntelligenceValidationIssue[]
}
