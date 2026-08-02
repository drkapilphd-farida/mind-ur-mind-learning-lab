'use server'

import { createClient } from '@/lib/supabase/server'
import { createMentorSession } from '../persistence/createMentorSession'
import type { MentorSession } from '../types/MentorSession'

export type StartMentorSessionResult = { success: true; session: MentorSession } | { success: false; error: string }

// AI Mentor™ Sprint-1 — Foundation. Session lifecycle — start. A real,
// minimal session row, never a chunk-based `AdaptiveRuntimeState` (AI
// Mentor has no ULO/document to schedule chunks through). No AI call —
// "no conversational AI features yet."
export async function startMentorSession(): Promise<StartMentorSessionResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not signed in.' }

  const session = await createMentorSession(supabase, user.id)
  if (!session) return { success: false, error: 'Failed to start a mentor session.' }

  return { success: true, session }
}
