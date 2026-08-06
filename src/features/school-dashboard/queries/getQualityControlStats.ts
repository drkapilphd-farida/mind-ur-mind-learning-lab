import { createServiceClient } from '@/lib/supabase/service'
import { computeAverageScore, computeNps, needsQualityReview } from '../npsScore'
import type { SchoolType } from '../types'

export type QualityControlRow = {
  schoolId: string
  name: string
  slug: string
  type: SchoolType
  responseCount: number
  averageScore: number | null
  nps: number
  needsReview: boolean
}

// Master-admin only — powers /admin/quality-control. Reads via
// createServiceClient() (bypasses RLS), same posture as every other
// master-admin query in this feature. Every ACTIVE tenant is included,
// even ones with zero feedback yet — a tenant with no data is itself
// worth surfacing to a master admin, not silently hidden. Sorted lowest
// NPS first, so a tenant that needs a quality audit is the first thing
// the admin sees, not something they have to sort for.
export async function getQualityControlStats(): Promise<QualityControlRow[]> {
  const supabase = createServiceClient()

  const [{ data: schools }, { data: feedbackRows }] = await Promise.all([
    supabase.from('schools').select('id, name, slug, type').eq('status', 'active'),
    supabase.from('parent_feedback').select('school_id, nps_score'),
  ])

  const allSchools = schools ?? []

  const scoresBySchoolId = new Map<string, number[]>()
  for (const row of feedbackRows ?? []) {
    const scores = scoresBySchoolId.get(row.school_id) ?? []
    scores.push(row.nps_score)
    scoresBySchoolId.set(row.school_id, scores)
  }

  return allSchools
    .map((school) => {
      const scores = scoresBySchoolId.get(school.id) ?? []
      return {
        schoolId: school.id,
        name: school.name,
        slug: school.slug,
        type: school.type as SchoolType,
        responseCount: scores.length,
        averageScore: computeAverageScore(scores),
        nps: computeNps(scores),
        needsReview: needsQualityReview(scores),
      }
    })
    .sort((a, b) => a.nps - b.nps || a.name.localeCompare(b.name))
}
