import type { AdaptationPriority } from './AdaptationPriority'
import type { AdaptationRuleType } from './AdaptationRuleType'

// Immutable — every field `readonly`. One rule's evaluated outcome —
// always produced, whether `applied` or not, so "Applied adaptations"
// and "Rejected adaptations" can both be counted in diagnostics.
export type AdaptationResult = {
  readonly ruleId: string
  readonly type: AdaptationRuleType
  readonly value: string
  readonly applied: boolean
  readonly priority: AdaptationPriority
  readonly reason: string
}
