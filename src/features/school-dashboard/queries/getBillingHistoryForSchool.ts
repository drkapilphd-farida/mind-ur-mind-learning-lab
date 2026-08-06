import { createClient } from '@/lib/supabase/server'
import type { BillingEventRow, BillingEventType } from './getTenantDetail'

// Portal-facing (school-admin / partner-admin) — RLS
// (school_billing_events_select_admin, via the existing
// is_school_admin() helper) does the real gating, so this only ever
// returns the caller's own tenant's history regardless of the schoolId
// passed in.
export async function getBillingHistoryForSchool(schoolId: string): Promise<BillingEventRow[]> {
  const supabase = await createClient()

  const { data: rows } = await supabase
    .from('school_billing_events')
    .select('id, event_type, amount_cents, currency, occurred_at')
    .eq('school_id', schoolId)
    .order('occurred_at', { ascending: false })
    .limit(50)

  return (rows ?? []).map((row) => ({
    id: row.id,
    eventType: row.event_type as BillingEventType,
    amountCents: row.amount_cents,
    currency: row.currency,
    occurredAt: row.occurred_at,
  }))
}
