import type { StrategyResult } from '../strategyDomain'
import type { AdaptivePlanExecutionFacts, ExecutionSequence, ExecutionStep } from '../executionDomain'

// Pure — "Session grouping." Prefers the selected `session-length`
// StrategyResult; falls back to the Adaptive Learning Planner's™ own
// `sessionDurationMinutes` when no session-length strategy was selected.
export function sequenceSessionGrouping(
  strategyResults: readonly StrategyResult[],
  facts: AdaptivePlanExecutionFacts,
): ExecutionSequence {
  const strategyResult = strategyResults.find((result) => result.type === 'session-length')
  const value = strategyResult?.value ?? (facts.sessionDurationMinutes != null ? String(facts.sessionDurationMinutes) : null)
  if (!value) return { type: 'session', steps: [] }

  const step: ExecutionStep = {
    id: `session-${value}`,
    sequenceType: 'session',
    referenceId: value,
    order: 0,
    priority: 'normal',
    detail: strategyResult ? strategyResult.reason : `Adaptive Learning Planner™ session duration: ${value} minutes`,
  }
  return { type: 'session', steps: [step] }
}
