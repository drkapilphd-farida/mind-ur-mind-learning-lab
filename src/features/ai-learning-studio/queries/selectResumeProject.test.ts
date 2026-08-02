import { describe, expect, it } from 'vitest'
import type { LearningProject } from '@/types/learning'
import { selectResumeProject } from './selectResumeProject'

function project(overrides: Partial<LearningProject>): LearningProject {
  return {
    id: 'project-1',
    userId: 'user-1',
    familyId: null,
    title: 'Untitled',
    description: null,
    status: 'active',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}

describe('selectResumeProject', () => {
  it('returns null for real zero projects', () => {
    expect(selectResumeProject([])).toBeNull()
  })

  it('returns null when every real project is completed or archived', () => {
    const projects = [project({ id: 'a', status: 'completed' }), project({ id: 'b', status: 'archived' })]
    expect(selectResumeProject(projects)).toBeNull()
  })

  it('returns the most recently updated active project, regardless of array order', () => {
    const older = project({ id: 'older', status: 'active', updatedAt: '2026-01-01T00:00:00.000Z' })
    const newer = project({ id: 'newer', status: 'active', updatedAt: '2026-01-05T00:00:00.000Z' })

    expect(selectResumeProject([older, newer])?.id).toBe('newer')
    expect(selectResumeProject([newer, older])?.id).toBe('newer')
  })

  it('ignores completed/archived projects even when they are the most recently updated', () => {
    const activeProject = project({ id: 'active', status: 'active', updatedAt: '2026-01-01T00:00:00.000Z' })
    const completedProject = project({ id: 'completed', status: 'completed', updatedAt: '2026-01-09T00:00:00.000Z' })

    expect(selectResumeProject([activeProject, completedProject])?.id).toBe('active')
  })
})
