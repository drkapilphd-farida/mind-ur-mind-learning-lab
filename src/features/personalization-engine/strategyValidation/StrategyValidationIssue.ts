// "Duplicate strategies, Invalid priorities, Missing dependencies,
// Circular strategy references, Empty strategy sets" — the Sprint 24
// brief's own five named validation checks.
export type StrategyValidationIssueType = 'duplicate-strategy' | 'invalid-priority' | 'missing-dependency' | 'circular-reference' | 'empty-strategy-set'

// Immutable — every field `readonly`.
export type StrategyValidationIssue = {
  readonly type: StrategyValidationIssueType
  readonly strategyId: string | null
  readonly detail: string
}
