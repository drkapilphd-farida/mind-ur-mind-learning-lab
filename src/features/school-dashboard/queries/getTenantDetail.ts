import { createServiceClient } from '@/lib/supabase/service'
import { deriveSubscriptionStatus, type SubscriptionStatus } from '../subscriptionStatus'
import type { School, SchoolMemberStatus, SchoolStatus, SchoolTier, SchoolType } from '../types'

export type TenantStudentRow = {
  schoolMemberId: string
  userId: string
  fullName: string | null
  username: string | null
  rollNumber: string | null
  status: SchoolMemberStatus
  aiDocumentsProcessed: number
}

export type TenantDetail = {
  school: School
  ownerEmail: string | null
  studentCount: number
  aiUsageThisMonth: number
  subscriptionStatus: SubscriptionStatus
  students: TenantStudentRow[]
}

function startOfCurrentMonth(): Date {
  const date = new Date()
  date.setDate(1)
  date.setHours(0, 0, 0, 0)
  return date
}

// Master-admin only — powers the /admin/tenants/[tenantId] drill-down.
// A LIGHT per-student view (roster + one AI-usage number) by design —
// not a full per-student analytics page (reading trends, chapter
// history, etc.); that's a materially larger feature, deliberately not
// built here.
export async function getTenantDetail(schoolId: string): Promise<TenantDetail | null> {
  const supabase = createServiceClient()

  const { data: schoolRow } = await supabase
    .from('schools')
    .select('id, name, slug, logo_url, type, tier, max_students, monthly_ai_quota, status, owner_id, expires_at, created_at, updated_at')
    .eq('id', schoolId)
    .maybeSingle()

  if (!schoolRow) {
    return null
  }

  const [ownerUserResponse, { data: memberRows }, { data: usageRows }] = await Promise.all([
    supabase.auth.admin.getUserById(schoolRow.owner_id),
    supabase
      .from('school_members')
      .select('id, user_id, role, status, username, roll_number')
      .eq('school_id', schoolId)
      .eq('role', 'student')
      .order('created_at', { ascending: true }),
    supabase.from('school_ai_usage_log').select('user_id, occurred_at').eq('school_id', schoolId),
  ])

  const students = memberRows ?? []

  // school_members and profiles both reference auth.users independently
  // (no direct FK), so PostgREST can't embed profiles(...) — same
  // second-pass-and-merge convention as getSchoolMembers.ts.
  const { data: profileRows } =
    students.length === 0 ? { data: [] } : await supabase.from('profiles').select('id, full_name').in(
      'id',
      students.map((row) => row.user_id),
    )

  const fullNameByUserId = new Map((profileRows ?? []).map((profile) => [profile.id, profile.full_name]))

  const monthStart = startOfCurrentMonth()
  const aiUsageCountByUserId = new Map<string, number>()
  let aiUsageThisMonth = 0
  for (const row of usageRows ?? []) {
    aiUsageCountByUserId.set(row.user_id, (aiUsageCountByUserId.get(row.user_id) ?? 0) + 1)
    if (new Date(row.occurred_at) >= monthStart) {
      aiUsageThisMonth += 1
    }
  }

  return {
    school: {
      id: schoolRow.id,
      name: schoolRow.name,
      slug: schoolRow.slug,
      logoUrl: schoolRow.logo_url,
      type: schoolRow.type as SchoolType,
      tier: schoolRow.tier as SchoolTier,
      maxStudents: schoolRow.max_students,
      monthlyAiQuota: schoolRow.monthly_ai_quota,
      status: schoolRow.status as SchoolStatus,
      ownerId: schoolRow.owner_id,
      expiresAt: schoolRow.expires_at,
      createdAt: schoolRow.created_at,
      updatedAt: schoolRow.updated_at,
    },
    ownerEmail: ownerUserResponse.data.user?.email ?? null,
    studentCount: students.length,
    aiUsageThisMonth,
    subscriptionStatus: deriveSubscriptionStatus(schoolRow.expires_at),
    students: students.map((row) => ({
      schoolMemberId: row.id,
      userId: row.user_id,
      fullName: fullNameByUserId.get(row.user_id) ?? null,
      username: row.username,
      rollNumber: row.roll_number,
      status: row.status as SchoolMemberStatus,
      aiDocumentsProcessed: aiUsageCountByUserId.get(row.user_id) ?? 0,
    })),
  }
}
