import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { getAppDomain } from '@/lib/domains/appDomain'
import { ChooseLearningMethodExperience } from '@/components/welcome/ChooseLearningMethodExperience'

export const metadata: Metadata = {
  title: 'Choose Learning Method',
}

// Sprint LW-1C — Choose Learning Method™. Replaces the previous
// `/welcome/preparing` ModulePlaceholder stub (renamed to this route —
// its only referrer, LearningGoalSelector.tsx, was updated in the same
// sprint).
//
// Gateway Auth Modal™ — this page used to hard-redirect signed-out
// visitors to /login before ever rendering, so they never saw the two
// cards at all. It no longer does: both cards are now visible to everyone,
// and ChooseLearningMethodExperience itself gates each card's action
// behind a modal (not a page redirect) when `isAuthenticated` is false —
// see that component for why. This is still the one real auth check for
// this route (outside `PROTECTED_PATHS`, no shared `/welcome/*`
// layout.tsx), just no longer load-bearing for *access* — only for which
// UI state renders.
//
// Domain Split™ — this is the universal front door for BOTH domains
// (never gated by src/middleware.ts's DOMAIN_ROUTES), so it has to pick
// its own single card per domain rather than showing one fixed set —
// see ChooseLearningMethodExperience.tsx for what each domain actually
// shows.
export default async function ChooseLearningMethodPage(): Promise<React.JSX.Element> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const appDomain = await getAppDomain()

  return <ChooseLearningMethodExperience isAuthenticated={user !== null} appDomain={appDomain} />
}
