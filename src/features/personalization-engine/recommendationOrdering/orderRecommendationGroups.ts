import type { StrategyResult, StrategyType } from '../strategyDomain'
import type { RecommendationCategory, RecommendationGroup, RecommendationItem, RecommendationPriority } from '../recommendationDomain'

// "Execution sequence" — the same order Sprint 25's own `generateExecutionPlan`
// already produces its sequences in, re-applied explicitly here so
// ordering is independently verifiable rather than merely inherited.
const CATEGORY_ORDER: readonly RecommendationCategory[] = ['journey', 'exercise', 'difficulty', 'review', 'session']

const PRIORITY_RANK: Record<RecommendationPriority, number> = { critical: 0, high: 1, normal: 2, low: 3 }

// Only these 3 categories are ever backed by a selected Strategy Engine™
// result (Sprint 24) — journey/exercise come from the Adaptive Learning
// Planner™ side of the execution plan only.
const CATEGORY_TO_STRATEGY_TYPE: Partial<Record<RecommendationCategory, StrategyType>> = {
  difficulty: 'difficulty',
  review: 'review-frequency',
  session: 'session-length',
}

function hasMatchingStrategyResult(item: RecommendationItem, strategyResults: readonly StrategyResult[]): boolean {
  const strategyType = CATEGORY_TO_STRATEGY_TYPE[item.category]
  if (!strategyType) return false
  return strategyResults.some((result) => result.type === strategyType)
}

function orderItems(items: readonly RecommendationItem[], strategyResults: readonly StrategyResult[]): readonly RecommendationItem[] {
  return [...items].sort((a, b) => {
    const priorityDiff = PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority]
    if (priorityDiff !== 0) return priorityDiff

    const aHasStrategy = hasMatchingStrategyResult(a, strategyResults)
    const bHasStrategy = hasMatchingStrategyResult(b, strategyResults)
    if (aHasStrategy !== bHasStrategy) return aHasStrategy ? -1 : 1

    return a.id.localeCompare(b.id)
  })
}

// Pure — "Priority, Strategy precedence, Execution sequence, Stable
// tie-breaking. No ranking models." Groups are ordered by
// `CATEGORY_ORDER`; each group's items are ordered by priority, then
// strategy precedence, then a deterministic `id` tie-break — never by
// input array order.
export function orderRecommendationGroups(
  groups: readonly RecommendationGroup[],
  strategyResults: readonly StrategyResult[],
): readonly RecommendationGroup[] {
  return [...groups]
    .sort((a, b) => CATEGORY_ORDER.indexOf(a.category) - CATEGORY_ORDER.indexOf(b.category))
    .map((group) => ({ category: group.category, items: orderItems(group.items, strategyResults) }))
}
