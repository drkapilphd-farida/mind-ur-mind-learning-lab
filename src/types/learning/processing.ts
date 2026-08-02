// AI Processing Experience™ types. ALS-15 Instant Learning Engine™ —
// these four ids now describe Phase 1 "Quick Intelligence" only (target
// ≤30s, zero AI calls): the workspace opens the instant this real,
// atomic call resolves. Phase 3 "Background AI Intelligence" (chunk
// enrichment, knowledge graph, learning analysis) runs afterward, tracked
// separately by `BackgroundProcessingSnapshot`
// (`src/app/preview/learning-projects/[id]/actions.ts`), not by this
// type. Deliberately separate from the `documents` domain's own `status`
// column: a Document's lifecycle is 'processing' | 'workspace_ready' |
// 'ready' | 'failed', while a ProcessingStage is the finer-grained Phase 1
// state within a single 'processing' document.

export type ProcessingStageId = 'upload-complete' | 'reading-structure' | 'chapters-organized' | 'blueprint-ready'

export type ProcessingStageStatus = 'pending' | 'active' | 'complete' | 'error'

export type ProcessingStageState = {
  id: ProcessingStageId
  status: ProcessingStageStatus
  progress: number
}
