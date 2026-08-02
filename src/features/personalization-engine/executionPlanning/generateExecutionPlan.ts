import {
  sequenceDifficultyProgression,
  sequenceExercises,
  sequenceJourney,
  sequenceReviewScheduling,
  sequenceSessionGrouping,
} from '../executionSequencing'
import type { ExecutionSequence, PersonalizationExecutionPlan } from '../executionDomain'
import type { ExecutionPlannerInputs } from './ExecutionPlannerInputs'

// Pure — "Transform ... into immutable execution plans." Composes the
// five deterministic sequencers, in the Sprint 25 brief's own Section 3
// order, and drops any sequence that produced no steps — a plan only
// ever names the sequences it actually has content for, never an empty
// placeholder.
export function generateExecutionPlan(inputs: ExecutionPlannerInputs, now: string, id: string): PersonalizationExecutionPlan {
  const candidateSequences: readonly ExecutionSequence[] = [
    sequenceJourney(inputs.adaptivePlanFacts),
    sequenceExercises(inputs.adaptivePlanFacts),
    sequenceDifficultyProgression(inputs.strategyResults, inputs.adaptivePlanFacts),
    sequenceReviewScheduling(inputs.strategyResults),
    sequenceSessionGrouping(inputs.strategyResults, inputs.adaptivePlanFacts),
  ]

  const sequences = candidateSequences.filter((sequence) => sequence.steps.length > 0)

  return {
    id,
    version: 1,
    sequences,
    metadata: { learnerId: inputs.learnerId, profileId: inputs.profileId, source: 'execution-planner', generatedAt: now },
  }
}
