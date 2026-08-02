export type { ProcessingStageId, ProcessingStageStatus, ProcessingStageState } from './processing'
export type {
  BlueprintDifficulty,
  BlueprintConcept,
  BlueprintChapter,
  BlueprintJourneyStepId,
  BlueprintJourneyStep,
  KnowledgeMapNodeLevel,
  KnowledgeMapNode,
  BlueprintOverview,
  BlueprintInsightLevel,
  BlueprintInsights,
  LearningBlueprint,
} from './blueprint'
export type { ProjectLifecycleStageId, ProjectLifecycleStatus, ProjectLifecycleStageState } from './lifecycle'
export type { JourneyStepStatus, JourneyStepWithStatus } from './journeyProgress'

// Domain types for `learning`. Mirrors `learning_projects` and
// `learning_sessions` from
// supabase/migrations/20260711000002_create_learning_projects_and_documents.sql
// and 20260711000003_create_learning_sessions.sql — see
// docs/adr/0001-ai-learning-studio-domain-model.md §2 for why
// LearningSession is one generic, extensible shape rather than a type
// per feature.

export type LearningProjectStatus = 'active' | 'archived' | 'completed'

export type LearningProject = {
  id: string
  userId: string
  familyId: string | null
  title: string
  description: string | null
  status: LearningProjectStatus
  createdAt: string
  updatedAt: string
}

export type LearningSessionType = 'reading' | 'memory' | 'revision' | 'research'
export type LearningSessionStatus = 'in_progress' | 'completed' | 'abandoned'

// `TData` narrows the otherwise-opaque `data` payload for a specific
// session type at the call site (e.g. `LearningSession<ReadingSessionData>`)
// — the column itself stays `jsonb`/`Record<string, unknown>` in the
// database and at this generic type's default, exactly as designed in
// the ADR: shape validated in application code, not the schema.
export type LearningSession<TData = Record<string, unknown>> = {
  id: string
  userId: string
  learningProjectId: string | null
  sessionType: LearningSessionType
  status: LearningSessionStatus
  data: TData
  startedAt: string
  completedAt: string | null
  createdAt: string
  updatedAt: string
}
