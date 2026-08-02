import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { RecordAndLearnExperience } from '@/components/welcome/RecordAndLearnExperience'

export const metadata: Metadata = {
  title: 'Record & Learn',
}

// Sprint LW-1C — Record & Learn™. Same in-page auth-check pattern as every
// other `/welcome/*` route — load-bearing, not stylistic, since
// `/welcome/*` has no shared layout.tsx and is outside `PROTECTED_PATHS`
// (src/middleware.ts). Reached from Choose Learning Method™'s Record &
// Learn™ card.
export default async function RecordPage(): Promise<React.JSX.Element> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login?next=/welcome/record')

  return <RecordAndLearnExperience />
}
