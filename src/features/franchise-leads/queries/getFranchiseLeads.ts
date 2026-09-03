import { createServiceClient } from '@/lib/supabase/service'
import type { FranchiseLeadStatus } from '../actions/updateFranchiseLeadStatus'

export type FranchiseLeadRow = {
  id: string
  name: string
  phone: string
  city: string
  background: string | null
  whyInterested: string | null
  status: FranchiseLeadStatus
  submittedAt: string
}

// Master-admin only, same posture as getTenantsOverviewRows.ts —
// createServiceClient() bypasses RLS; access control is the
// (admin)/layout.tsx ADMIN_EMAILS gate, not RLS. Never call from client
// code — the service-role client must never reach the browser bundle.
export async function getFranchiseLeads(): Promise<FranchiseLeadRow[]> {
  const supabase = createServiceClient()
  const { data } = await supabase
    .from('franchise_leads')
    .select('id, name, phone, city, background, why_interested, status, submitted_at')
    .order('submitted_at', { ascending: false })

  return (data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    phone: row.phone,
    city: row.city,
    background: row.background,
    whyInterested: row.why_interested,
    status: row.status as FranchiseLeadStatus,
    submittedAt: row.submitted_at,
  }))
}
