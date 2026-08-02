import { evaluateCondition } from '../ruleEngine'
import type { PersonalizationStrategy } from '../strategyDomain'
import type { StrategyEvaluationInputs } from './StrategyEvaluationInputs'

// Pure — "Implement deterministic evaluation... No probabilistic
// logic. No AI inference." A strategy is eligible iff the profile is
// currently active *and* (when present) its condition matches the
// given context — directly reusing Sprint 23's own `evaluateCondition`
// (intra-feature, the exact same function `PersonalizationRule`
// evaluation already uses).
export function isStrategyEligible(strategy: PersonalizationStrategy, inputs: StrategyEvaluationInputs): boolean {
  if (inputs.profile.lifecycle !== 'active') return false
  if (strategy.condition !== null && !evaluateCondition(strategy.condition, inputs.context)) return false
  return true
}
