'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'

const SubmitParentFeedbackInputSchema = z
  .object({
    schoolId: z.string().uuid(),
    npsScore: z.number().int().min(0).max(10),
    feedbackText: z.string().trim().max(2000).optional(),
  })
  .strict()

export type SubmitParentFeedbackResult = { success: true } | { success: false; error: string }

// Unlike every other write in this feature area, this one goes through
// the RLS-gated createClient() rather than the service-role client —
// the actor here IS the resource owner (a real, DB-expressible
// auth.uid()), so parent_feedback_insert_own's RLS policy (see
// 20260808000001_add_parent_feedback.sql) is the correct enforcement
// mechanism, not a server-side ADMIN_EMAILS check. If the caller isn't
// an active student of schoolId, the insert is rejected by RLS itself,
// not by application logic here.
export async function submitParentFeedback(input: unknown): Promise<SubmitParentFeedbackResult> {
  const parsed = SubmitParentFeedbackInputSchema.safeParse(input)
  if (!parsed.success) {
    logger.warn('[school-dashboard] submitParentFeedback input failed validation', { issues: parsed.error.issues })
    return { success: false, error: 'Please check your rating and try again.' }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Please sign in to submit feedback.' }
  }

  const { error } = await supabase.from('parent_feedback').insert({
    school_id: parsed.data.schoolId,
    user_id: user.id,
    nps_score: parsed.data.npsScore,
    feedback_text: parsed.data.feedbackText === undefined || parsed.data.feedbackText === '' ? null : parsed.data.feedbackText,
  })

  if (error) {
    logger.warn('[school-dashboard] submitParentFeedback — insert FAIL', { userId: user.id, schoolId: parsed.data.schoolId, error: error.message })
    return { success: false, error: 'Could not submit your feedback. Please try again.' }
  }

  return { success: true }
}
