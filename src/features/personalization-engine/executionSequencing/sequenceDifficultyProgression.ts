import type { StrategyResult } from '../strategyDomain'
import type { AdaptivePlanExecutionFacts, ExecutionSequence, ExecutionStep } from '../executionDomain'

// Pure — "Difficulty progression." Prefers the selected `difficulty`
// StrategyResult (Sprint 24's own Strategy Engine™ output) when
// present; falls back to the Adaptive Learning Planner's™ own
// difficulty level when no difficulty strategy was selected — never
// both, a single progression step with one source of truth.
export function sequenceDifficultyProgression(
  strategyResults: readonly StrategyResult[],
  facts: AdaptivePlanExecutionFacts,
): ExecutionSequence {
  const strategyResult = strategyResults.find((result) => result.type === 'difficulty')
  const value = strategyResult?.value ?? facts.difficultyLevel
  if (!value) return { type: 'difficulty', steps: [] }

  const step: ExecutionStep = {
    id: `difficulty-${value}`,
    sequenceType: 'difficulty',
    referenceId: value,
    order: 0,
    priority: 'high',
    detail: strategyResult ? strategyResult.reason : `Adaptive Learning Planner™ difficulty level: ${value}`,
  }
  return { type: 'difficulty', steps: [step] }
}
