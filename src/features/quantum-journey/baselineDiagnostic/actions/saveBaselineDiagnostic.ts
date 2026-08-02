'use server'

import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'
import { BaselineDiagnosticInputSchema } from './baselineDiagnosticSchema'

export type SaveBaselineDiagnosticResult = { success: true } | { success: false; error: string }

// Persists the mandatory 30-Second Baseline Speed & Comprehension
// Diagnostic™ — exactly once per user, ever (journey_baseline_diagnostics
// has a UNIQUE constraint on user_id and no update policy; this is a
// locked-in reference point, not something later attempts can overwrite).
// Anonymous visitors: a silent no-op returning success, matching this
// project's existing posture for save actions reached without a session.
export async function saveBaselineDiagnostic(input: unknown): Promise<SaveBaselineDiagnosticResult> {
  const parsed = BaselineDiagnosticInputSchema.safeParse(input)
  if (!parsed.success) {
    logger.warn('baseline diagnostic input failed validation', { issues: parsed.error.issues })
    return { success: false, error: 'Invalid diagnostic data.' }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: true }
  }

  const { rawWpm, accuracyPercent, trueBaselineWpm } = parsed.data

  const { error } = await supabase.from('journey_baseline_diagnostics').insert({
    user_id: user.id,
    raw_wpm: rawWpm,
    accuracy_percent: accuracyPercent,
    true_baseline_wpm: trueBaselineWpm,
  })

  if (error) {
    logger.warn('failed to save baseline diagnostic', { error: error.message })
    return { success: false, error: 'Something went wrong. Please try again.' }
  }

  return { success: true }
}
