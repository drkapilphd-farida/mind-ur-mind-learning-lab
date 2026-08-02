import type { PersonalizationStrategy } from '../strategyDomain'
import { detectCircularReferences } from './detectCircularReferences'
import { isValidPriority } from './isValidPriority'
import type { StrategyValidationIssue } from './StrategyValidationIssue'
import type { StrategyValidationResult } from './StrategyValidationResult'

// Pure — validates a whole registered strategy set together (several
// of the brief's checks are inherently cross-strategy, not
// per-strategy). Checks, in order:
//
// - empty-strategy-set: no strategies at all.
// - duplicate-strategy: the same `id` appears more than once.
// - invalid-priority: any strategy's own `priority` isn't a
//   non-negative integer.
// - missing-dependency: a `dependsOnStrategyIds` entry doesn't
//   correspond to any strategy in the given set.
// - circular-reference: the dependency graph contains a cycle.
export function validateStrategySet(strategies: readonly PersonalizationStrategy[]): StrategyValidationResult {
  const issues: StrategyValidationIssue[] = []

  if (strategies.length === 0) {
    issues.push({ type: 'empty-strategy-set', strategyId: null, detail: 'The strategy set contains no strategies.' })
    return { valid: false, issues }
  }

  const knownIds = new Set(strategies.map((strategy) => strategy.id))
  const seenIds = new Set<string>()

  for (const strategy of strategies) {
    if (seenIds.has(strategy.id)) {
      issues.push({ type: 'duplicate-strategy', strategyId: strategy.id, detail: `Strategy id "${strategy.id}" appears more than once.` })
    }
    seenIds.add(strategy.id)

    if (!isValidPriority(strategy.priority)) {
      issues.push({
        type: 'invalid-priority',
        strategyId: strategy.id,
        detail: `Priority "${strategy.priority}" must be a non-negative integer.`,
      })
    }

    for (const dependencyId of strategy.dependsOnStrategyIds) {
      if (!knownIds.has(dependencyId)) {
        issues.push({
          type: 'missing-dependency',
          strategyId: strategy.id,
          detail: `Strategy "${strategy.id}" depends on unknown strategy id "${dependencyId}".`,
        })
      }
    }
  }

  for (const strategyId of detectCircularReferences(strategies)) {
    issues.push({ type: 'circular-reference', strategyId, detail: `Strategy "${strategyId}" is part of a circular dependency chain.` })
  }

  return { valid: issues.length === 0, issues }
}
