'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { findActiveMentorSession } from '../persistence/findActiveMentorSession'
import { buildMentorSessionContext } from '../context/buildMentorSessionContext'
import { recommendMentorFocus } from '../recommendations/recommendMentorFocus'
import type { MentorRecommendation } from '../types/MentorRecommendation'

const GetMentorRecommendationsInputSchema = z.string().uuid()

export type GetMentorRecommendationsResult = { success: true; recommendations: readonly MentorRecommendation[] } | { success: false; error: string }

// AI Mentor™ Sprint-3. Real, deterministic recommendations — lifts
// Sprint-1's own "no recommendations generation yet" exclusion. Requires
// a real, active, caller-owned mentor session, the same ownership check
// `getMentorSessionContext`/`sendMentorMessage` already established. No
// AI call — `recommendMentorFocus` is pure, threshold-based logic over
// the real context `buildMentorSessionContext` (Sprint-1, extended
// additively this sprint) already computes.
export async function getMentorRecommendations(input: unknown): Promise<GetMentorRecommendationsResult> {
  const parsed = GetMentorRecommendationsInputSchema.safeParse(input)
  if (!parsed.success) return { success: false, error: 'Invalid mentor session request.' }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not signed in.' }

  const activeSession = await findActiveMentorSession(supabase, user.id)
  if (!activeSession || activeSession.id !== parsed.data) return { success: false, error: 'Mentor session not found.' }

  const context = await buildMentorSessionContext(supabase, user.id)
  return { success: true, recommendations: recommendMentorFocus(context) }
}
