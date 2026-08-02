import { listLearningProjects } from '@/api/learning'
import { listDocuments } from '@/api/documents'
import { checkReadingAssessmentExists } from './checkReadingAssessmentExists'

export type RetakeableAssessment = {
  projectId: string
  projectTitle: string
  documentId: string
  documentTitle: string
}

// Reading Assessment Engine™ — Settings' own real "Retake Assessment"
// list. Reuses the exact same `checkReadingAssessmentExists` the read
// route itself calls (no new bulk-query engine) — one real existence
// check per real Learning Project, same `documents[0]` convention the
// read route already relies on. A handful of projects per learner makes
// this real, sequential N+1 an honest trade for reusing existing code
// rather than a new, separately-maintained join query.
export async function listRetakeableAssessments(userId: string): Promise<readonly RetakeableAssessment[]> {
  const projects = await listLearningProjects(userId)
  const results: RetakeableAssessment[] = []

  for (const project of projects) {
    const documents = await listDocuments(userId, project.id)
    const document = documents[0]
    if (!document) continue

    const assessmentCheck = await checkReadingAssessmentExists({ documentId: document.id })
    if (assessmentCheck.success && assessmentCheck.exists) {
      results.push({ projectId: project.id, projectTitle: project.title, documentId: document.id, documentTitle: document.title })
    }
  }

  return results
}
