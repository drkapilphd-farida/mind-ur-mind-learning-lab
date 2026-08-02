'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { findActiveMentorSession } from '../persistence/findActiveMentorSession'
import { buildMentorSessionContext } from '../context/buildMentorSessionContext'
import type { MentorSessionContext } from '../types/MentorSessionContext'

const GetMentorSessionContextInputSchema = z.string().uuid()

export type GetMentorSessionContextResult = { success: true; context: MentorSessionContext } | { success: false; error: string }

// AI Mentor™ Sprint-1 — Foundation. Shared data contract — the real,
// read-only cross-module context a future conversation (Sprint-2+) will
// read from. Requires a real, active session belonging to the caller —
// context is real input *into* a session, not computed independently of
// one. No AI call, no recommendation — "no recommendations generation
// yet."
export async function getMentorSessionContext(input: unknown): Promise<GetMentorSessionContextResult> {
  const parsed = GetMentorSessionContextInputSchema.safeParse(input)
  if (!parsed.success) return { success: false, error: 'Invalid mentor session request.' }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not signed in.' }

  const activeSession = await findActiveMentorSession(supabase, user.id)
  if (!activeSession || activeSession.id !== parsed.data) return { success: false, error: 'Mentor session not found.' }

  const context = await buildMentorSessionContext(supabase, user.id)
  return { success: true, context }
}
