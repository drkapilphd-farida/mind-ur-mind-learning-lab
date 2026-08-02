'use server'

import { createClient } from '@/lib/supabase/server'
import { findActiveMentorSession } from '../persistence/findActiveMentorSession'
import type { MentorSession } from '../types/MentorSession'

export type GetActiveMentorSessionResult = { success: true; session: MentorSession | null } | { success: false; error: string }

// AI Mentor™ Sprint-1 — Foundation. Session lifecycle — recovery. The
// real question the route needs answered before it can offer "Start" or
// "Continue": does this learner already have a real, active mentor
// session? `session: null` is a real, honest "no active session," never
// an error.
export async function getActiveMentorSession(): Promise<GetActiveMentorSessionResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not signed in.' }

  const session = await findActiveMentorSession(supabase, user.id)
  return { success: true, session }
}
