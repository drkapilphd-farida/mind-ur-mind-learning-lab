'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

const ResetReadingAssessmentInputSchema = z.object({
  documentId: z.string().uuid(),
})

export type ResetReadingAssessmentResult = { success: true } | { success: false; error: string }

// Reading Assessment Engine™ — the real "Retake Assessment" mechanism
// (from Settings). Deletes this learner's own current Reading Profile
// row for a document; the next `/read` visit for it finds no assessment
// via `checkReadingAssessmentExists` and naturally re-enters the
// assessment flow — no separate "retake mode" flag needed anywhere.
export async function resetReadingAssessment(input: unknown): Promise<ResetReadingAssessmentResult> {
  const parsed = ResetReadingAssessmentInputSchema.safeParse(input)
  if (!parsed.success) return { success: false, error: 'Invalid request.' }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not signed in.' }

  const { error } = await supabase.from('qsr_reading_assessments').delete().eq('user_id', user.id).eq('document_id', parsed.data.documentId)

  if (error) return { success: false, error: 'Failed to reset your reading assessment.' }

  return { success: true }
}
