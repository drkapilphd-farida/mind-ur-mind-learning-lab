import { createServiceClient } from '@/lib/supabase/service'
import { deriveSubscriptionStatus, type SubscriptionStatus } from '../subscriptionStatus'
import type { SchoolStatus, SchoolTier, SchoolType } from '../types'

export type TenantOverviewRow = {
  id: string
  name: string
  slug: string
  type: SchoolType
  ownerEmail: string | null
  tier: SchoolTier
  status: SchoolStatus
  studentCount: number
  maxStudents: number
  aiUsageThisMonth: number
  monthlyAiQuota: number
  subscriptionStatus: SubscriptionStatus
}

function startOfCurrentMonth(): Date {
  const date = new Date()
  date.setDate(1)
  date.setHours(0, 0, 0, 0)
  return date
}

// Master-admin only — the one enriched tenant read shared by
// TenantsTable.tsx (filtered to one type) and the admin overview page's
// Quick Actions toolbar (unfiltered, both types, for export/search).
// createServiceClient() bypasses RLS, same posture as every other
// master-admin page — access control is the (admin)/layout.tsx
// ADMIN_EMAILS gate, not RLS. Never call this from client code — the
// service-role client must never reach the browser bundle.
export async function getTenantsOverviewRows(type?: SchoolType): Promise<TenantOverviewRow[]> {
  const supabase = createServiceClient()

  let schoolsQuery = supabase
    .from('schools')
    .select('id, name, slug, type, tier, max_students, monthly_ai_quota, status, owner_id, expires_at, created_at')
    .order('created_at', { ascending: false })
  if (type !== undefined) {
    schoolsQuery = schoolsQuery.eq('type', type)
  }

  const { data: schools } = await schoolsQuery
  const allSchools = schools ?? []
  const schoolIds = allSchools.map((school) => school.id)

  const [{ data: studentRows }, { data: usageRows }, ownerUserResponses] = await Promise.all([
    schoolIds.length === 0
      ? Promise.resolve({ data: [] })
      : supabase.from('school_members').select('school_id').eq('role', 'student').eq('status', 'active').in('school_id', schoolIds),
    schoolIds.length === 0
      ? Promise.resolve({ data: [] })
      : supabase.from('school_ai_usage_log').select('school_id').gte('occurred_at', startOfCurrentMonth().toISOString()).in('school_id', schoolIds),
    Promise.all(allSchools.map((school) => supabase.auth.admin.getUserById(school.owner_id))),
  ])

  const studentCountBySchoolId = new Map<string, number>()
  for (const row of studentRows ?? []) {
    studentCountBySchoolId.set(row.school_id, (studentCountBySchoolId.get(row.school_id) ?? 0) + 1)
  }

  const aiUsageBySchoolId = new Map<string, number>()
  for (const row of usageRows ?? []) {
    aiUsageBySchoolId.set(row.school_id, (aiUsageBySchoolId.get(row.school_id) ?? 0) + 1)
  }

  const ownerEmailBySchoolId = new Map<string, string | null>()
  allSchools.forEach((school, index) => {
    ownerEmailBySchoolId.set(school.id, ownerUserResponses[index]?.data.user?.email ?? null)
  })

  return allSchools.map((school) => ({
    id: school.id,
    name: school.name,
    slug: school.slug,
    type: school.type as SchoolType,
    ownerEmail: ownerEmailBySchoolId.get(school.id) ?? null,
    tier: school.tier as SchoolTier,
    status: school.status as SchoolStatus,
    studentCount: studentCountBySchoolId.get(school.id) ?? 0,
    maxStudents: school.max_students,
    aiUsageThisMonth: aiUsageBySchoolId.get(school.id) ?? 0,
    monthlyAiQuota: school.monthly_ai_quota,
    subscriptionStatus: deriveSubscriptionStatus(school.expires_at),
  }))
}
