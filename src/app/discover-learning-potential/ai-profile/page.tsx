import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { buildAiLearningProfile } from '@/features/discover-learning-potential/profile/buildAiLearningProfile'
import { AiProfileScreen } from './components/AiProfileScreen'

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
