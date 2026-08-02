// Compile-time constants for the `learning` domain. Mirrors the CHECK
// constraints in
// supabase/migrations/20260711000002_create_learning_projects_and_documents.sql
// and 20260711000003_create_learning_sessions.sql.

export const LEARNING_PROJECT_STATUSES = ['active', 'archived', 'completed'] as const

// The four extensible session types, per the domain model (ADR 0001 §2)
// — adding a fifth type here must also update the database CHECK
// constraint in the same migration-review pass.
export const LEARNING_SESSION_TYPES = ['reading', 'memory', 'revision', 'research'] as const

export const LEARNING_SESSION_STATUSES = ['in_progress', 'completed', 'abandoned'] as const

export {
  QUICK_INTELLIGENCE_STAGES,
  BACKGROUND_INTELLIGENCE_STAGES,
  type ProcessingStageDefinition,
  type BackgroundIntelligenceStageId,
  type BackgroundIntelligenceStageDefinition,
} from './processingStages'
export { PROJECT_LIFECYCLE_STAGES, type ProjectLifecycleStageDefinition } from './lifecycleStages'
export { STUDY_MODES, type StudyModeId, type StudyModeDefinition } from './studyModes'
export { DAILY_INSIGHTS } from './dailyInsights'
export { LEARNING_GOALS, type LearningGoalId, type LearningGoalDefinition } from './learningGoals'
