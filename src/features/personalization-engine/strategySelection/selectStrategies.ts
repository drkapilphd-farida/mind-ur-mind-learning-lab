import type { PersonalizationDecision } from '../domain'
import type { PersonalizationStrategy, StrategyResult, StrategyType } from '../strategyDomain'
import { isStrategyEligible } from '../strategyEvaluation'
import type { StrategyEvaluationInputs } from '../strategyEvaluation'
import { describeSelectionReason } from './describeSelectionReason'

// "Difficulty Strategy, Learning Sequence Strategy, Review Frequency
// Strategy, Session Length Strategy" — the Sprint 24 brief's own
// Section 4 list, in the fixed order results are produced.
const STRATEGY_TYPES: readonly StrategyType[] = ['difficulty', 'learning-sequence', 'review-frequency', 'session-length']

function pickHighestPriority(candidates: readonly PersonalizationStrategy[]): PersonalizationStrategy | null {
  if (candidates.length === 0) return null

  // "Selection must preserve rule priority": lowest `priority` number
  // wins; ties broken deterministically by `id` so repeated selection
  // over identical input always produces the identical winner.
  return [...candidates].sort((a, b) => a.priority - b.priority || a.id.localeCompare(b.id))[0]!
}

// Pure — "Support deterministic selection... Selection must preserve
// rule priority." For each of the 4 supported strategy types,
// independently: filter to eligible candidates of that type, pick the
// single highest-priority one (if any), and produce its result. A
// type with no eligible strategy simply produces no result — never a
// placeholder or a guess.
export function selectStrategies(
  strategies: readonly PersonalizationStrategy[],
  inputs: StrategyEvaluationInputs,
): readonly StrategyResult[] {
  return STRATEGY_TYPES.flatMap((type) => {
    const eligible = strategies.filter((strategy) => strategy.type === type && isStrategyEligible(strategy, inputs))
    const selected = pickHighestPriority(eligible)
    if (!selected) return []

    return [buildStrategyResult(selected, inputs.decisions)]
  })
}

function buildStrategyResult(strategy: PersonalizationStrategy, decisions: readonly PersonalizationDecision[]): StrategyResult {
  return {
    strategyId: strategy.id,
    type: strategy.type,
    value: strategy.outcomeValue,
    reason: describeSelectionReason(strategy, decisions),
  }
}
