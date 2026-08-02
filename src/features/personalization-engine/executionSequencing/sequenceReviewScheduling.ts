import type { StrategyResult } from '../strategyDomain'
import type { ExecutionSequence, ExecutionStep } from '../executionDomain'

// Pure — "Review scheduling." One step from the selected
// `review-frequency` StrategyResult, or an empty sequence when none was
// selected — this sequence has no Adaptive Learning Planner™ fallback,
// since review frequency is exclusively a Strategy Engine™ concern (no
// `AdaptiveLearningPlan` field corresponds to it).
export function sequenceReviewScheduling(strategyResults: readonly StrategyResult[]): ExecutionSequence {
  const strategyResult = strategyResults.find((result) => result.type === 'review-frequency')
  if (!strategyResult) return { type: 'review', steps: [] }

  const step: ExecutionStep = {
    id: `review-${strategyResult.strategyId}`,
    sequenceType: 'review',
    referenceId: strategyResult.value,
    order: 0,
    priority: 'normal',
    detail: strategyResult.reason,
  }
  return { type: 'review', steps: [step] }
}
