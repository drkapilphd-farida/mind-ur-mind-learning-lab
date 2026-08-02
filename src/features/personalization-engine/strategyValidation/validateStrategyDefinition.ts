import type { PersonalizationStrategy } from '../strategyDomain'
import { isValidPriority } from './isValidPriority'
import type { StrategyValidationIssue } from './StrategyValidationIssue'
import type { StrategyValidationResult } from './StrategyValidationResult'

// Pure — "Validate strategy definitions" (Section 2): checks "Invalid
// priorities" (Section 5) against one strategy in isolation,
// independent of any registry or set — a strategy can be authored and
// checked before it's ever registered.
export function validateStrategyDefinition(strategy: PersonalizationStrategy): StrategyValidationResult {
  const issues: StrategyValidationIssue[] = []

  if (!isValidPriority(strategy.priority)) {
    issues.push({
      type: 'invalid-priority',
      strategyId: strategy.id,
      detail: `Priority "${strategy.priority}" must be a non-negative integer.`,
    })
  }

  return { valid: issues.length === 0, issues }
}
