import { createServiceClient } from '@/lib/supabase/service'
import { computeLeaderboardScore, deriveRankTier, type LeaderboardRankTier } from '../leaderboard'
import type { SchoolTier, SchoolType } from '../types'

export type LeaderboardRow = {
  schoolId: string
  name: string
  slug: string
  logoUrl: string | null
  tier: SchoolTier
  studentCount: number
  maxStudents: number
  aiUsageThisMonth: number
  score: number
  rank: number
  rankTier: LeaderboardRankTier
}

function startOfCurrentMonth(): Date {
  const date = new Date()
  date.setDate(1)
  date.setHours(0, 0, 0, 0)
  return date
}

// Master-admin only — powers /admin/leaderboard. Reads via
// createServiceClient() (bypasses RLS), same posture as every other
// master-admin query in this feature — access control is the
// (admin)/layout.tsx ADMIN_EMAILS gate, not RLS.
//
// Ranking is scoped to ONE tenant type at a time (never schools vs.
// franchise partners mixed into a single ranking) — a school and a
// franchise partner network aren't a fair comparison, and the portal's
// own "National Rank" / "Network Rank" framing (see TENANT_COPY)
// depends on this same per-type scoping. getTenantRank.ts reuses this
// function for exactly that reason.
//
// Only ACTIVE tenants are ranked (mirrors getPlatformOverviewStats /
// getTenantsOverviewRows) — a suspended/archived tenant isn't part of
// the platform's live standings.
export async function getLeaderboardRows(type: SchoolType): Promise<LeaderboardRow[]> {
  const supabase = createServiceClient()

  const { data: schools } = await supabase
    .from('schools')
    .select('id, name, slug, logo_url, tier, max_students')
    .eq('type', type)
    .eq('status', 'active')

  const allSchools = schools ?? []
  const schoolIds = allSchools.map((school) => school.id)

  const [{ data: studentRows }, { data: usageRows }] = await Promise.all([
    schoolIds.length === 0
      ? Promise.resolve({ data: [] })
      : supabase.from('school_members').select('school_id').eq('role', 'student').eq('status', 'active').in('school_id', schoolIds),
    schoolIds.length === 0
      ? Promise.resolve({ data: [] })
      : supabase.from('school_ai_usage_log').select('school_id').gte('occurred_at', startOfCurrentMonth().toISOString()).in('school_id', schoolIds),
  ])

  const studentCountBySchoolId = new Map<string, number>()
  for (const row of studentRows ?? []) {
    studentCountBySchoolId.set(row.school_id, (studentCountBySchoolId.get(row.school_id) ?? 0) + 1)
  }

  const aiUsageBySchoolId = new Map<string, number>()
  for (const row of usageRows ?? []) {
    aiUsageBySchoolId.set(row.school_id, (aiUsageBySchoolId.get(row.school_id) ?? 0) + 1)
  }

  const unranked = allSchools.map((school) => {
    const studentCount = studentCountBySchoolId.get(school.id) ?? 0
    const aiUsageThisMonth = aiUsageBySchoolId.get(school.id) ?? 0
    return {
      schoolId: school.id,
      name: school.name,
      slug: school.slug,
      logoUrl: school.logo_url,
      tier: school.tier as SchoolTier,
      studentCount,
      maxStudents: school.max_students,
      aiUsageThisMonth,
      score: computeLeaderboardScore(studentCount, aiUsageThisMonth),
    }
  })

  // Deterministic ordering: score desc, then student count desc, then
  // name asc — so two tenants that end up tied on score never "jump
  // around" between requests depending on row-fetch order.
  unranked.sort((a, b) => b.score - a.score || b.studentCount - a.studentCount || a.name.localeCompare(b.name))

  return unranked.map((row, index) => {
    const rank = index + 1
    return { ...row, rank, rankTier: deriveRankTier(rank) }
  })
}
