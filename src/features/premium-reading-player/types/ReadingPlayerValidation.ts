import type { ReadingPlayerValidationIssue } from './ReadingPlayerValidationIssue'

export type ReadingPlayerValidation = {
  readonly valid: boolean
  readonly issues: readonly ReadingPlayerValidationIssue[]
}
