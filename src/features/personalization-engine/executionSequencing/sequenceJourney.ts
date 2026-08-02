import type { AdaptivePlanExecutionFacts, ExecutionSequence, ExecutionStep } from '../executionDomain'

// Pure — "Journey ordering." One step, the recommended journey itself,
// or an empty sequence when the Adaptive Learning Planner™ named none.
export function sequenceJourney(facts: AdaptivePlanExecutionFacts): ExecutionSequence {
  if (!facts.journey) return { type: 'journey', steps: [] }

  const step: ExecutionStep = {
    id: `journey-${facts.journey}`,
    sequenceType: 'journey',
    referenceId: facts.journey,
    order: 0,
    priority: 'high',
    detail: `Recommended journey: ${facts.journey}`,
  }
  return { type: 'journey', steps: [step] }
}
