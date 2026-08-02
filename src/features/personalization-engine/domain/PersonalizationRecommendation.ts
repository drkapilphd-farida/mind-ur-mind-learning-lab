import type { PersonalizationDecisionType } from './PersonalizationDecisionType'

// Immutable — every field `readonly`. One matched rule's contribution
// to a decision — "data models only," never itself applied to any
// Reading Lab/Memory Lab state.
export type PersonalizationRecommendation = {
  readonly decisionType: PersonalizationDecisionType
  readonly value: string
  readonly matchedRuleId: string
  readonly reason: string
}
