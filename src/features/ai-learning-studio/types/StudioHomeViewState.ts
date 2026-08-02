import type { LearningProject } from '@/types/learning'

// The Studio home route's own state model — the "Studio state
// architecture" every future AI Learning Studio™ sprint (Upload
// Experience, Universal Content Engine, Learning Blueprint, Workspace)
// extends rather than re-derives. Two states only, matching the
// Dashboard's own "empty state is the whole page, not a hollow grid"
// philosophy (docs/adr/0001, LearningProjectsEmptyState.tsx).
export type StudioHomeViewState =
  | { kind: 'empty' }
  | { kind: 'active'; projects: readonly LearningProject[]; resumeProject: LearningProject | null }
