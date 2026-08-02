import { listLearningProjects } from '@/api/learning'
import type { StudioHomeViewState } from '../types/StudioHomeViewState'
import { selectResumeProject } from './selectResumeProject'

// The one server-side read the Studio home route needs — existing
// project detection plus the resume-target decision, composed from the
// same `listLearningProjects` the real Dashboard already uses (no
// duplicate data-access logic).
export async function getStudioHomeViewState(userId: string): Promise<StudioHomeViewState> {
  const projects = await listLearningProjects(userId)

  if (projects.length === 0) return { kind: 'empty' }

  return { kind: 'active', projects, resumeProject: selectResumeProject(projects) }
}
