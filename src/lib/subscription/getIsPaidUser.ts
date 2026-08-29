import { createClient } from '@/lib/supabase/server'

// Every new signup gets 60 days of free practice access from
// profiles.created_at before any paid gate applies — after that, access
// requires a real subscription row (qsr-masterclass or the ₹499
// qsr-app-continued plan, see 20260826000001_..._device_binding.sql).
const FREE_WINDOW_DAYS = 60

// Real, RLS-respecting check against the `subscriptions` table (see
// supabase/migrations/20260711000005_create_plans_subscriptions_entitlements.sql),
// with the 60-day free window layered on top. Every existing paid gate in
// the app calls this one function (directly or via
// hasQuantumSpeedReadingProAccess), so the free window applies everywhere
// at once — QSR journey pages, the habit.mindurmind.org.in dashboard,
// and the Quantum Mind App login check — with no call-site changes.
export async function getIsPaidUser(userId: string): Promise<boolean> {
  const supabase = await createClient()

  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('id')
    .eq('user_id', userId)
    .in('status', ['active', 'trialing'])
    .limit(1)
    .maybeSingle()

  if (subscription !== null) return true

  const { data: profile } = await supabase.from('profiles').select('created_at').eq('id', userId).maybeSingle()
  if (profile === null) return false

  const freeWindowEnd = new Date(profile.created_at)
  freeWindowEnd.setDate(freeWindowEnd.getDate() + FREE_WINDOW_DAYS)

  return new Date() < freeWindowEnd
}
