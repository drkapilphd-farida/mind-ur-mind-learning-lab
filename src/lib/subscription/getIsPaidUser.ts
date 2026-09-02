import { createClient } from '@/lib/supabase/server'

// Real, RLS-respecting check against the `subscriptions` table (see
// supabase/migrations/20260711000005_create_plans_subscriptions_entitlements.sql).
// No free-access window: a user is paid if and only if they have a real
// `active`/`trialing` subscription row — qsr-masterclass (₹4,999,
// granted by the masterclass webhook on payment) or qsr-app-continued
// (₹499/mo). Every existing paid gate in the app calls this one
// function (directly or via hasQuantumSpeedReadingProAccess), so this
// applies everywhere at once — QSR journey pages, the
// habit.mindurmind.org.in dashboard, and the Quantum Mind App login
// check — with no call-site changes.
//
// Previously layered a 60-day free window on top of this (computed from
// profiles.created_at) — removed per explicit correction: there is no
// free-access tier to the program itself. What's free is the Reading
// Speed Test and the live intro session, neither of which are gated by
// this function.
export async function getIsPaidUser(userId: string): Promise<boolean> {
  const supabase = await createClient()

  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('id')
    .eq('user_id', userId)
    .in('status', ['active', 'trialing'])
    .limit(1)
    .maybeSingle()

  return subscription !== null
}
