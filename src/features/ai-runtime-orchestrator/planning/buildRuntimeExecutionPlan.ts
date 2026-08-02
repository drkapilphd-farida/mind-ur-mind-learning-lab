import type { RuntimeOrchestrationInputs } from '../integration'
import type { RuntimeExecutionPlan, RuntimeState } from '../types'

const PLANNED_STAGES: readonly RuntimeState[] = [
  'pending',
  'personalization-ready',
  'recommendation-ready',
  'mentor-ready',
  'provider-selected',
  'model-selected',
  'request-ready',
  'adapter-processed',
  'response-ready',
  'completed',
]

// Pure — "Runtime initialization" (§ brief): the deterministic,
// planned sequence of `RuntimeState`s this run will attempt (fixed,
// same for every run) plus the selection hints that drive Provider/
// Model Selection, lifted straight from the raw inputs.
export function buildRuntimeExecutionPlan(inputs: RuntimeOrchestrationInputs): RuntimeExecutionPlan {
  return {
    plannedStages: PLANNED_STAGES,
    preferredProviderId: inputs.preferredProviderId,
    preferredModelId: inputs.preferredModelId,
    requestedCapability: inputs.requestedCapability,
    minimumContextSize: inputs.minimumContextSize,
  }
}
