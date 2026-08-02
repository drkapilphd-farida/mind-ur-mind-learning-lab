// Project lifecycle types (Sprint 2, Chunk 1). Distinct from
// ProcessingStageId (the 7-stage AI Processing Experience™ animation,
// Sprint 1 Chunk 3) and BlueprintJourneyStep (the in-blueprint learning
// path, Sprint 1 Chunk 4) — this is the project's own coarse lifecycle,
// shown in the Hero's progress ribbon and the ProgressTimeline section.

export type ProjectLifecycleStageId = 'upload' | 'processing' | 'blueprint-ready' | 'learning-started' | 'completed'

export type ProjectLifecycleStatus = 'complete' | 'current' | 'upcoming'

export type ProjectLifecycleStageState = {
  id: ProjectLifecycleStageId
  status: ProjectLifecycleStatus
}
