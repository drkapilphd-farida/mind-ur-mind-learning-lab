import type { StrategyValidationIssue } from './StrategyValidationIssue'

// Immutable — every field `readonly`. `valid` is true iff `issues` is
// empty — "strategy selection integrity" as a whole.
export type StrategyValidationResult = {
  readonly valid: boolean
  readonly issues: readonly StrategyValidationIssue[]
}
