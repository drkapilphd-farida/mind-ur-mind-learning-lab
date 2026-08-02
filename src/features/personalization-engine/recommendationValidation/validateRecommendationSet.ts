import { orderRecommendationGroups } from '../recommendationOrdering'
import type { StrategyResult } from '../strategyDomain'
import type { PersonalizationFacts } from '../domain'
import type { PersonalizationRecommendationSet } from '../recommendationDomain'
import type { RecommendationValidationIssue } from './RecommendationValidationIssue'
import type { RecommendationValidationResult } from './RecommendationValidationResult'

// Pure — validates a whole recommendation set together, same
// "issues list" shape as `executionValidation/validateExecutionPlan.ts`.
// Checks, in order:
//
// - empty-recommendation-set: the set has no items at all, across any
//   group.
// - invalid-reference: an item's `referenceId` is blank.
// - duplicate-recommendation: the same item `id` appears more than once
//   in the set.
// - ordering-violation: the set's groups/items don't match what
//   `orderRecommendationGroups` (Sprint 26's own "Priority, Strategy
//   precedence, Execution sequence, Stable tie-breaking" rule) would
//   produce — reused here rather than a second, divergent comparison.
// - configuration-violation: a `maxRecommendationsPerCategory` fact, if
//   present, is exceeded by any group's item count.
export function validateRecommendationSet(
  set: PersonalizationRecommendationSet,
  strategyResults: readonly StrategyResult[],
  configurationFacts: PersonalizationFacts,
): RecommendationValidationResult {
  const issues: RecommendationValidationIssue[] = []
  const allItems = set.groups.flatMap((group) => group.items)

  if (allItems.length === 0) {
    issues.push({ type: 'empty-recommendation-set', itemId: null, detail: 'The recommendation set contains no items.' })
    return { valid: false, issues }
  }

  const seenIds = new Set<string>()
  for (const item of allItems) {
    if (!item.referenceId.trim()) {
      issues.push({ type: 'invalid-reference', itemId: item.id, detail: `Recommendation "${item.id}" has an empty referenceId.` })
    }

    if (seenIds.has(item.id)) {
      issues.push({ type: 'duplicate-recommendation', itemId: item.id, detail: `Recommendation id "${item.id}" appears more than once in the set.` })
    }
    seenIds.add(item.id)
  }

  const expectedOrder = orderRecommendationGroups(set.groups, strategyResults)
    .flatMap((group) => group.items.map((item) => item.id))
    .join('|')
  const actualOrder = set.groups.flatMap((group) => group.items.map((item) => item.id)).join('|')
  if (actualOrder !== expectedOrder) {
    issues.push({
      type: 'ordering-violation',
      itemId: null,
      detail: 'The recommendation set is not ordered by execution sequence, priority, and strategy precedence.',
    })
  }

  const maxRecommendationsPerCategory = configurationFacts.maxRecommendationsPerCategory
  if (typeof maxRecommendationsPerCategory === 'number') {
    for (const group of set.groups) {
      if (group.items.length > maxRecommendationsPerCategory) {
        issues.push({
          type: 'configuration-violation',
          itemId: null,
          detail: `Group "${group.category}" has ${group.items.length} recommendations, exceeding configured max of ${maxRecommendationsPerCategory}.`,
        })
      }
    }
  }

  return { valid: issues.length === 0, issues }
}
