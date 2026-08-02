import type { PersonalizationCondition } from '../domain'
import type { StrategyId } from './StrategyId'
import type { StrategyMetadata } from './StrategyMetadata'
import type { StrategyPriority } from './StrategyPriority'
import type { StrategyType } from './StrategyType'

// The core immutable strategy model — every field `readonly`.
// `condition` reuses Sprint 23's own `PersonalizationCondition`
// (intra-feature — `PersonalizationStrategy` and
// `PersonalizationRule` are siblings in the same feature, not a
// cross-feature dependency) — `null` means the strategy has no
// eligibility condition of its own beyond the profile being active.
// `dependsOnStrategyIds` is purely structural, checked by
// `strategyValidation/validateStrategySet.ts` ("Missing dependencies",
// "Circular strategy references") — it is never consulted during
// evaluation or selection, keeping those two concerns independent of
// whether the dependency graph is well-formed.
export type PersonalizationStrategy = {
  readonly id: StrategyId
  readonly type: StrategyType
  readonly priority: StrategyPriority
  readonly dependsOnStrategyIds: readonly StrategyId[]
  readonly condition: PersonalizationCondition | null
  readonly outcomeValue: string
  readonly metadata: StrategyMetadata
}
