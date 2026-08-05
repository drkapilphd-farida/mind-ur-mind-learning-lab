import { createClient } from '@/lib/supabase/server'
import type { SchoolMemberRole, SchoolMemberStatus, SchoolMemberWithProfile } from '../types'

// Full roster for a school, joined with profiles for a display name.
// Relies entirely on RLS (school_members_select_admin_all_or_self) to
// scope results to what the caller is actually allowed to see — an
// admin gets every row, anyone else gets only their own.
export async function getSchoolMembers(schoolId: string): Promise<SchoolMemberWithProfile[]> {
  const supabase = await createClient()

  const { data: rows } = await supabase
    .from('school_members')
    .select('id, school_id, user_id, role, status, username, roll_number, created_at, updated_at')
    .eq('school_id', schoolId)
    .eq('status', 'active')
    .order('created_at', { ascending: true })

  if (!rows || rows.length === 0) {
    return []
  }

  // school_members and profiles both reference auth.users independently
  // (no direct FK between them), so PostgREST can't embed profiles(...)
  // in the query above — fetched as a second pass and merged in memory
  // instead.
  const { data: profileRows } = await supabase
    .from('profiles')
    .select('id, full_name')
    .in('id', rows.map((row) => row.user_id))

  const fullNameByUserId = new Map((profileRows ?? []).map((profile) => [profile.id, profile.full_name]))

  return rows.map((row) => ({
    id: row.id,
    schoolId: row.school_id,
    userId: row.user_id,
    role: row.role as SchoolMemberRole,
    status: row.status as SchoolMemberStatus,
    username: row.username,
    rollNumber: row.roll_number,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    fullName: fullNameByUserId.get(row.user_id) ?? null,
  }))
}
