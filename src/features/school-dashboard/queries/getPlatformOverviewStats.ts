import { createServiceClient } from '@/lib/supabase/service'
import { deriveSubscriptionStatus, type SubscriptionStatus } from '../subscriptionStatus'
import type { SchoolType } from '../types'

export type PlatformOverviewStats = {
  schoolCount: number
  partnerCount: number
  totalStudents: number
  totalSeats: number
  aiUsageThisMonth: number
  totalAiQuota: number
  subscriptionStatusCounts: Record<SubscriptionStatus, number>
}

function startOfCurrentMonth(): Date {
  const date = new Date()
  date.setDate(1)
  date.setHours(0, 0, 0, 0)
  return date
}

// Master-admin only — powers the platform overview cards on /admin.
// Reads via createServiceClient() (bypasses RLS), same posture as
// TenantsTable.tsx — access control is the (admin)/layout.tsx
// ADMIN_EMAILS gate, not RLS. Only ACTIVE schools/partners count toward
// these totals (matches the "Total Active Schools & Franchise Partners"
// framing) — a suspended/archived tenant's seats/quota aren't part of
// the platform's live capacity.
export async function getPlatformOverviewStats(): Promise<PlatformOverviewStats> {
  const supabase = createServiceClient()

  const [{ data: schools }, { data: studentRows }, { data: usageRows }] = await Promise.all([
    supabase.from('schools').select('id, type, max_students, monthly_ai_quota, expires_at').eq('status', 'active'),
    supabase.from('school_members').select('school_id').eq('role', 'student').eq('status', 'active'),
    supabase.from('school_ai_usage_log').select('id').gte('occurred_at', startOfCurrentMonth().toISOString()),
  ])

  const allSchools = schools ?? []

  const studentCountBySchoolId = new Map<string, number>()
  for (const row of studentRows ?? []) {
    studentCountBySchoolId.set(row.school_id, (studentCountBySchoolId.get(row.school_id) ?? 0) + 1)
  }

  const subscriptionStatusCounts: Record<SubscriptionStatus, number> = { active: 0, expiring_soon: 0, expired: 0 }
  let schoolCount = 0
  let partnerCount = 0
  let totalStudents = 0
  let totalSeats = 0
  let totalAiQuota = 0

  for (const school of allSchools) {
    if ((school.type as SchoolType) === 'franchise_partner') {
      partnerCount += 1
    } else {
      schoolCount += 1
    }
    totalStudents += studentCountBySchoolId.get(school.id) ?? 0
    totalSeats += school.max_students
    totalAiQuota += school.monthly_ai_quota
    subscriptionStatusCounts[deriveSubscriptionStatus(school.expires_at)] += 1
  }

  return {
    schoolCount,
    partnerCount,
    totalStudents,
    totalSeats,
    aiUsageThisMonth: (usageRows ?? []).length,
    totalAiQuota,
    subscriptionStatusCounts,
  }
}
