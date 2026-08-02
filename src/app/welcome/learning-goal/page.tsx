import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { LearningGoalSelector } from '@/components/welcome/LearningGoalSelector'

export const metadata: Metadata = {
  title: 'Learning Goal',
}

// Sprint LW-1A — Learning Goal™ (Screen 2 of the arrival flow). `/welcome/*`
// has no shared layout.tsx and is outside `PROTECTED_PATHS`
// (`src/middleware.ts`) — this per-page auth check is load-bearing here,
// not stylistic, same as `src/app/welcome/page.tsx` and
// `src/app/welcome/preparing/page.tsx`. Reached from the Arrival
// Experience's "Let's Begin" CTA; its own "Continue" goes to
// `/welcome/preparing?goal=<id>` — never to Upload this sprint (LW-1C
// scope).
export default async function LearningGoalPage(): Promise<React.JSX.Element> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login?next=/welcome/learning-goal')

  return <LearningGoalSelector />
}
