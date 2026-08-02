import type { PersonalizationExecutionPlan } from '@/features/personalization-engine'

// Pure — "Current Journey" (§4), read from the Execution Plan's own
// `journey` sequence rather than importing `AdaptiveLearningPlan` a
// second time — the execution plan (Sprint 25) already reduced the
// Adaptive Learning Planner's™ own output into this sequence.
export function buildCurrentJourney(executionPlan: PersonalizationExecutionPlan | null): string | null {
  const journeySequence = executionPlan?.sequences.find((sequence) => sequence.type === 'journey')
  return journeySequence?.steps[0]?.referenceId ?? null
}
