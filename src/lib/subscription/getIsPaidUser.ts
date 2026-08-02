import { createClient } from '@/lib/supabase/server'

// Real, RLS-respecting check against the `subscriptions` table (see
// supabase/migrations/20260711000005_create_plans_subscriptions_entitlements.sql).
// Resolves `false` for every user today — no billing is wired up yet, so the
// table has no rows — but this queries the real schema rather than a
// hardcoded stand-in, so it starts working the moment a real subscription
// row exists, with no call-site changes required.
export async function getIsPaidUser(userId: string): Promise<boolean> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('subscriptions')
    .select('id')
    .eq('user_id', userId)
    .in('status', ['active', 'trialing'])
    .limit(1)
    .maybeSingle()

  return data !== null
}
