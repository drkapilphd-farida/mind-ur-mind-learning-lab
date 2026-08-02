import type { ProjectLifecycleStageId } from '@/types/learning/lifecycle'

export type ProjectLifecycleStageDefinition = {
  id: ProjectLifecycleStageId
  label: string
  description: string
}

// The five-stage project lifecycle shown in the Hero's progress ribbon
// and the ProgressTimeline section (Sprint 2, Chunk 1). Real stages,
// not decorative — 'learning-started' and 'completed' stay honestly
// upcoming until real Learning Sessions exist.
export const PROJECT_LIFECYCLE_STAGES: readonly ProjectLifecycleStageDefinition[] = [
  { id: 'upload', label: 'Upload', description: 'Your document was added to this Learning Project.' },
  { id: 'processing', label: 'Processing', description: 'Your document was organized into a Learning Blueprint™.' },
  { id: 'blueprint-ready', label: 'Blueprint Ready', description: 'Your personalized learning path is ready to explore.' },
  { id: 'learning-started', label: 'Learning Started', description: 'You began working through your Learning Blueprint™.' },
  { id: 'completed', label: 'Completed', description: "You've finished this Learning Project." },
] as const
