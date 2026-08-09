'use server'

import { createClient } from '@/lib/supabase/server'

// Live Masterclass™ waitlist — whether the signed-in user has already
// joined, so the card can show "You're on the list" instead of the join
// button on repeat visits. Anonymous visitors: false, never an error (the
// card simply doesn't render for a logged-out session, same posture as
// every other dashboard-embedded card).
export async function getLiveMasterclassWaitlistStatus(): Promise<boolean> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return false

  const { data } = await supabase
    .from('live_masterclass_waitlist')
    .select('id')
    .eq('user_id', user.id)
    .limit(1)
    .maybeSingle()

  return data !== null
}
