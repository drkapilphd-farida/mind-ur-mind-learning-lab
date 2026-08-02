import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { listLearningProjects } from '@/api/learning'
import { getCurrentUserProfile } from '@/lib/supabase/getCurrentUserProfile'
import { createClient } from '@/lib/supabase/server'
import { ArrivalExperience } from '@/components/welcome/ArrivalExperience'

export const metadata: Metadata = {
  title: 'Welcome',
}

// Sprint LW-1A — Arrival Experience™ (Screen 1 of the new arrival flow,
// renamed from "Welcome Experience™"). Deliberately outside `/preview`
// entirely — `src/app/preview/layout.tsx` unconditionally wraps every
// `/preview/*` route in AppShell's persistent sidebar/topbar, which
// conflicts with this screen's "no complex navigation" requirement. Same
// in-page auth-check pattern already used by `src/app/preview/layout.tsx`
// and `src/app/preview/dashboard/page.tsx` — `middleware.ts`/
// `PROTECTED_PATHS` are untouched; this route (and every other `/welcome/*`
// route) secures itself the same way those two already do. Not yet the
// post-login default — see docs/PRODUCTION_HANDOFF_LW_1A.md for why that's
// an explicit LW-1B hook, not decided here.
export default async function WelcomePage(): Promise<React.JSX.Element> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login?next=/welcome')

  const [profile, projects] = await Promise.all([getCurrentUserProfile(user.id), listLearningProjects(user.id)])

  const firstName = profile?.fullName?.trim().split(' ')[0] ?? null
  const isReturningUser = projects.length > 0

  return <ArrivalExperience firstName={firstName !== null && firstName.length > 0 ? firstName : null} isReturningUser={isReturningUser} />
}
