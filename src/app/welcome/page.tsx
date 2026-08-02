import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'Welcome',
}

// One-Click Entry™ — every "Get Started" link across the app and
// marketing site points here, so this is the real front door. Arrival
// Experience™ (Sprint LW-1A) and the Learning Goal™ screen it led to are
// deliberately no longer in the path: both remain fully intact at
// /welcome (see ArrivalExperience.tsx, still reachable if a future flow
// wants it) and /welcome/learning-goal, just unlinked from here — the
// entry screen is now Choose Your Path™ directly, matching the locked
// "primary entry screen, two direct action cards, one click" onboarding
// spec. Same in-page auth-check pattern already used by every other
// `/welcome/*` route; `middleware.ts`/`PROTECTED_PATHS` are untouched.
export default async function WelcomePage(): Promise<React.JSX.Element> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login?next=/welcome/choose-method')

  redirect('/welcome/choose-method')
}
