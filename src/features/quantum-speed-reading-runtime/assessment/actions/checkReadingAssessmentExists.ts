'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

const CheckReadingAssessmentExistsInputSchema = z.object({
  documentId: z.string().uuid(),
})

export type CheckReadingAssessmentExistsResult = { success: true; exists: boolean } | { success: false; error: string }

// Reading Assessment Engine™ — the one real read the QSR read route needs
// to decide "has this learner already been measured for this document?"
// Real existence check, never a guess — an unauthenticated caller or a
// lookup error both honestly report `exists: false` at the call site
// only after this returns `success: false`, never silently treated as
// "no assessment."
export async function checkReadingAssessmentExists(input: unknown): Promise<CheckReadingAssessmentExistsResult> {
  const parsed = CheckReadingAssessmentExistsInputSchema.safeParse(input)
  if (!parsed.success) return { success: false, error: 'Invalid request.' }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not signed in.' }

  const { data, error } = await supabase.from('qsr_reading_assessments').select('id').eq('user_id', user.id).eq('document_id', parsed.data.documentId).maybeSingle()

  if (error) return { success: false, error: 'Failed to check your reading assessment.' }

  return { success: true, exists: data !== null }
}
