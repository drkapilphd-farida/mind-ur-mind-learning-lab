import { createClient } from '@/lib/supabase/server'
import type { School, SchoolMember, SchoolMemberRole, SchoolMemberStatus, SchoolStatus, SchoolTier, SchoolType } from '../types'

export type SchoolMembershipForUser = {
  member: SchoolMember
  school: School
}

// Resolves the signed-in caller's own tenant membership (school_admin/
// franchise_partner/teacher/student) and the tenant (school OR franchise
// partner — see school.type) it belongs to — the one read every
// (school-admin)/(partner-admin) page and the white-labeled consumer
// topbar need first. No signed-in user, or no membership row, both
// honestly resolve to null rather than throwing (mirrors
// getModuleProgress/getPracticeSessions).
export async function getSchoolForUser(): Promise<SchoolMembershipForUser | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const { data: memberRow } = await supabase
    .from('school_members')
    .select('id, school_id, user_id, role, status, username, roll_number, created_at, updated_at')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .maybeSingle()

  if (!memberRow) {
    return null
  }

  const { data: schoolRow } = await supabase
    .from('schools')
    .select('id, name, slug, logo_url, type, tier, max_students, monthly_ai_quota, status, owner_id, expires_at, created_at, updated_at')
    .eq('id', memberRow.school_id)
    .maybeSingle()

  if (!schoolRow) {
    return null
  }

  return {
    member: {
      id: memberRow.id,
      schoolId: memberRow.school_id,
      userId: memberRow.user_id,
      role: memberRow.role as SchoolMemberRole,
      status: memberRow.status as SchoolMemberStatus,
      username: memberRow.username,
      rollNumber: memberRow.roll_number,
      createdAt: memberRow.created_at,
      updatedAt: memberRow.updated_at,
    },
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
  }
}
