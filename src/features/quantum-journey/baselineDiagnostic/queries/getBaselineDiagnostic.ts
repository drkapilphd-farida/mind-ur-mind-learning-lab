'use server'

import { createClient } from '@/lib/supabase/server'

export type BaselineDiagnosticRecord = {
  rawWpm: number
  accuracyPercent: number
  trueBaselineWpm: number
  occurredAt: string
}

// Reads the signed-in user's own 30-Second Baseline Speed & Comprehension
// Diagnostic™ — at most one row ever exists per user (see the migration's
// UNIQUE constraint on user_id). An anonymous visitor, a user who hasn't
// taken the diagnostic yet, or a fetch error all return null — there is
// nothing to show yet, not a failure.
export async function getBaselineDiagnostic(): Promise<BaselineDiagnosticRecord | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data, error } = await supabase
    .from('journey_baseline_diagnostics')
    .select('raw_wpm, accuracy_percent, true_baseline_wpm, occurred_at')
    .eq('user_id', user.id)
    .maybeSingle()

  if (error || data === null) return null

  return {
    rawWpm: data.raw_wpm,
    accuracyPercent: data.accuracy_percent,
    trueBaselineWpm: data.true_baseline_wpm,
    occurredAt: data.occurred_at,
  }
}
