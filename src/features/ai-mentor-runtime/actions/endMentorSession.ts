'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { endMentorSession as endMentorSessionRecord } from '../persistence/endMentorSession'
import type { MentorSession } from '../types/MentorSession'

const EndMentorSessionInputSchema = z.string().uuid()

export type EndMentorSessionResult = { success: true; session: MentorSession } | { success: false; error: string }

// AI Mentor™ Sprint-1 — Foundation. Session lifecycle — end. Real
// ownership check happens at the persistence layer itself
// (`user_id` filter) — this Server Action's own job is auth + input
// validation only, the same boundary discipline every other action in
// this codebase follows.
export async function endMentorSession(input: unknown): Promise<EndMentorSessionResult> {
  const parsed = EndMentorSessionInputSchema.safeParse(input)
  if (!parsed.success) return { success: false, error: 'Invalid mentor session request.' }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not signed in.' }

  const session = await endMentorSessionRecord(supabase, user.id, parsed.data)
  if (!session) return { success: false, error: 'Mentor session not found.' }

  return { success: true, session }
}
