import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ChooseLearningMethodExperience } from '@/components/welcome/ChooseLearningMethodExperience'

export const metadata: Metadata = {
  title: 'Choose Learning Method',
}

// Sprint LW-1C — Choose Learning Method™. Replaces the previous
// `/welcome/preparing` ModulePlaceholder stub (renamed to this route —
// its only referrer, LearningGoalSelector.tsx, was updated in the same
// sprint). Same in-page auth-check pattern as every other `/welcome/*`
// route — load-bearing, not stylistic, since `/welcome/*` has no shared
// layout.tsx and is outside `PROTECTED_PATHS` (src/middleware.ts).
export default async function ChooseLearningMethodPage(): Promise<React.JSX.Element> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login?next=/welcome/choose-method')

  return <ChooseLearningMethodExperience />
}
