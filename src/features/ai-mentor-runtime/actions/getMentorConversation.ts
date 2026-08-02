'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { findActiveMentorSession } from '../persistence/findActiveMentorSession'
import { listMentorConversationTurns } from '../persistence/listMentorConversationTurns'
import type { MentorConversationTurn } from '../types/MentorConversationTurn'

const GetMentorConversationInputSchema = z.string().uuid()

export type GetMentorConversationResult = { success: true; turns: readonly MentorConversationTurn[] } | { success: false; error: string }

// AI Mentor™ Sprint-2. Real: loads a real, caller-owned mentor session's
// real turn history, chronological — what the workspace restores on
// load so a learner returning to an active session sees their real prior
// conversation, not a blank slate.
export async function getMentorConversation(input: unknown): Promise<GetMentorConversationResult> {
  const parsed = GetMentorConversationInputSchema.safeParse(input)
  if (!parsed.success) return { success: false, error: 'Invalid mentor session request.' }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not signed in.' }

  const activeSession = await findActiveMentorSession(supabase, user.id)
  if (!activeSession || activeSession.id !== parsed.data) return { success: false, error: 'Mentor session not found.' }

  const turns = await listMentorConversationTurns(supabase, activeSession.id)
  return { success: true, turns }
}
