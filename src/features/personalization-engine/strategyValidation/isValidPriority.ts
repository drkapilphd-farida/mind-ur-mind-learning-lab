import type { StrategyPriority } from '../strategyDomain'

// Pure — a valid priority is a non-negative integer. Shared by both
// `validateStrategyDefinition` (one strategy) and `validateStrategySet`
// (every strategy in a set).
export function isValidPriority(priority: StrategyPriority): boolean {
  return Number.isInteger(priority) && priority >= 0
}
