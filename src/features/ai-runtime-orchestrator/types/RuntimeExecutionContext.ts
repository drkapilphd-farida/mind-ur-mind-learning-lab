import type { RuntimeState } from './RuntimeState'

// Immutable — every field `readonly`. One of the brief's own 10 named
// responsibilities — self-contained (flat summary), mirroring
// `ai-orchestration-pipeline/types/AIOrchestrationContext.ts`'s own
// precedent — the internal, self-contained state-tracking record. The
// real, cross-feature entry-point input is the separate
// `../integration/RuntimeOrchestrationInputs.ts`.
export type RuntimeExecutionContext = {
  readonly learnerId: string
  readonly profileId: string
  readonly state: RuntimeState
  readonly completedStages: readonly RuntimeState[]
}
