import type { LearningProject } from '@/types/learning'

// The "resume learning entry point" decision: the most recently updated
// project still in progress. Completed/archived projects are never
// offered as the resume target — resuming a finished project isn't a
// meaningful action.
export function selectResumeProject(projects: readonly LearningProject[]): LearningProject | null {
  const active = projects.filter((project) => project.status === 'active')
  if (active.length === 0) return null

  return active.reduce((mostRecent, project) => (project.updatedAt > mostRecent.updatedAt ? project : mostRecent))
}
