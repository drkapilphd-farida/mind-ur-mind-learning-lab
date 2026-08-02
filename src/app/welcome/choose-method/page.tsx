import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
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
export default async function ChooseLearningMethodPage(): Promise<React.JSX.Element> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return <ChooseLearningMethodExperience isAuthenticated={user !== null} />
}
