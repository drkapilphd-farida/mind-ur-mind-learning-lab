import type { StrategyId } from './StrategyId'
import type { StrategyType } from './StrategyType'

// Immutable — every field `readonly`. One selected strategy's outcome
// — "Produce immutable strategy results."
export type StrategyResult = {
  readonly strategyId: StrategyId
  readonly type: StrategyType
  readonly value: string
  readonly reason: string
}
