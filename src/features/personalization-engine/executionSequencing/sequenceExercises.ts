import type { AdaptivePlanExecutionFacts, ExecutionSequence, ExecutionStep } from '../executionDomain'

// Pure — "Exercise ordering." One step per recommended exercise id, in
// the Adaptive Learning Planner's™ own array order — "preserve rule
// priority" applied here as preserving the planner's own order, never
// re-sorted.
export function sequenceExercises(facts: AdaptivePlanExecutionFacts): ExecutionSequence {
  const steps: ExecutionStep[] = facts.exerciseIds.map((exerciseId, index) => ({
    id: `exercise-${exerciseId}`,
    sequenceType: 'exercise',
    referenceId: exerciseId,
    order: index,
    priority: 'normal',
    detail: `Exercise: ${exerciseId}`,
  }))
  return { type: 'exercise', steps }
}
