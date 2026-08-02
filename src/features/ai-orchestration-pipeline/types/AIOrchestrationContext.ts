import type { PipelineStage } from './PipelineStage'

// Immutable — every field `readonly`. A flat, self-contained tracking
// record of pipeline progress — deliberately does NOT embed the
// coordinated features' own real objects (`MentorPersonalizationContext`,
// `ProviderExecutionResponse`, ...), which would break this feature's
// `types/` self-containment. Those objects only ever exist transiently
// inside `../orchestration/DefaultAIOrchestrationService.ts` during one
// run — see this feature's own `index.ts` header for the full
// reasoning.
export type AIOrchestrationContext = {
  readonly learnerId: string
  readonly profileId: string
  readonly stage: PipelineStage
  readonly completedStages: readonly PipelineStage[]
}
