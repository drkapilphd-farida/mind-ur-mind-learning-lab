'use server'

import { createClient } from '@/lib/supabase/server'
import { buildMentorSessionHistory } from '../context/buildMentorSessionHistory'
import type { MentorSessionHistoryEntry } from '../types/MentorSessionHistoryEntry'

export type GetMentorSessionHistoryResult = { success: true; history: readonly MentorSessionHistoryEntry[] } | { success: false; error: string }

// AI Mentor™ Sprint-4 — Session History. Real, learner-scoped — every
// real past and present mentor session, most recent first, with its real
// turn count. No AI call, no content preview — a real structural list
// only.
export async function getMentorSessionHistory(): Promise<GetMentorSessionHistoryResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not signed in.' }

  const history = await buildMentorSessionHistory(supabase, user.id)
  return { success: true, history }
}
