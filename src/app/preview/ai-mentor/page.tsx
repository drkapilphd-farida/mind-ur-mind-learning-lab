import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AiMentorWorkspace } from '@/features/ai-mentor-runtime/components'
import { findActiveMentorSession } from '@/features/ai-mentor-runtime/persistence/findActiveMentorSession'
import { buildMentorSessionHistory } from '@/features/ai-mentor-runtime/context/buildMentorSessionHistory'

export const metadata: Metadata = {
  title: 'AI Mentor',
}

// AI Mentor™ Sprint-1 — Foundation. Routing. A flat, learner-scoped
// route (sibling to `/preview/memory-insights`/`/preview/smart-notes-insights`),
// same auth pattern as every other `/preview/*` route. AI Mentor has no
// document to read, so — unlike QSR's/Memory's/Smart Notes' own routes —
// this one takes no `[id]` param; it's about the learner, not a specific
// document. The pre-existing `/preview/learning-studio/ai-mentor` mock
// placeholder is deliberately left untouched — it belongs to the
// separate, disconnected "AI Learning Studio™" mock catalog, the same
// track QSR's and Memory's own real routes have never touched either.
//
// AI Mentor™ Sprint-4 — Session History. `buildMentorSessionHistory` is
// fetched in parallel with the active-session check — the two are
// genuinely independent real queries, the same "no false dependency"
// discipline the Smart Notes route already established for its own
// parallel fetches.
export default async function AiMentorPage(): Promise<React.JSX.Element> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login?next=/preview/ai-mentor')

  const [activeSession, sessionHistory] = await Promise.all([findActiveMentorSession(supabase, user.id), buildMentorSessionHistory(supabase, user.id)])

  return <AiMentorWorkspace initialSession={activeSession} initialSessionHistory={sessionHistory} />
}
