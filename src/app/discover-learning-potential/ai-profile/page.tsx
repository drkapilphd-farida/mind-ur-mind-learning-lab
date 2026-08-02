import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { buildAiLearningProfile } from '@/features/discover-learning-potential/profile/buildAiLearningProfile'
import { AiProfileScreen } from './components/AiProfileScreen'

// Explicit, not load-bearing here — this route already renders dynamically
// on its own (supabase.auth.getUser() below reads cookies via next/headers,
// which auto-opts App Router out of static generation). Added per explicit
// request after a reported build-time prerender error on this route; a
// clean `next build` in this environment shows it already listed as ƒ
// (Dynamic), not ○ (Static), with zero prerender errors — so this line
// makes existing behavior explicit rather than actually changing it. If
// the original error persists after this, the real cause is elsewhere
// (likely deployment-environment-specific, not reproducible locally).
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Your AI Learning Profile — Mind Ur Mind Learning Lab™',
  description: 'Here is what we discovered about how you learn.',
}

// Discover Your Learning Potential™ — Sprint-1 Foundation. The locked
// flow's closing screen, reachable before sign-in like its three
// siblings (Reading/Memory/Focus Discovery) — an anonymous visitor
// honestly sees an empty-but-real profile (`buildAiLearningProfile`
// returns real, disclosed empty state, never a guess).
export default async function AiProfilePage(): Promise<React.JSX.Element> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const profile = await buildAiLearningProfile(user?.id ?? null)

  return <AiProfileScreen profile={profile} />
}
