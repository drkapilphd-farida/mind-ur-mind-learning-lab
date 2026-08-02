import type { PayloadValidationIssue } from './PayloadValidationIssue'

// Immutable — every field `readonly`. `valid` is true iff `issues` is
// empty — "payload integrity" as a whole.
export type PayloadValidationResult = {
  readonly valid: boolean
  readonly issues: readonly PayloadValidationIssue[]
}
