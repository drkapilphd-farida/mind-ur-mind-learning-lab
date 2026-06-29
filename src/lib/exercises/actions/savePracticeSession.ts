'use server'

import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'
import { PracticeSessionInputSchema, type PracticeSessionResult } from '../types'

// Persists current exercise status (in_progress / completed) for the signed-in
// user. These routes are reachable without signing in, so "no user" is a
// normal case, not a failure — practice just isn't tracked for that visit.
// Completion is sticky: an incomplete replay never downgrades an exercise
// that was already completed.
export async function savePracticeSession(input: unknown): Promise<PracticeSessionResult> {
  const parsed = PracticeSessionInputSchema.safeParse(input)
  if (!parsed.success) {
    logger.warn('practice session input failed validation', { issues: parsed.error.issues })
    return { success: false, error: 'Invalid practice session data.' }
  }

  const { labId, exerciseId, completed } = parsed.data

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: true }
  }

  const { data: existing } = await supabase
    .from('exercise_progress')
    .select('status')
    .eq('user_id', user.id)
    .eq('lab_id', labId)
    .eq('exercise_id', exerciseId)
    .maybeSingle()

  if (existing?.status === 'completed' && !completed) {
    return { success: true }
  }

  const { error } = await supabase.from('exercise_progress').upsert(
    {
      user_id: user.id,
      lab_id: labId,
      exercise_id: exerciseId,
      status: completed ? 'completed' : 'in_progress',
      completed_at: completed ? new Date().toISOString() : null,
    },
    { onConflict: 'user_id,lab_id,exercise_id' },
  )

  if (error) {
    logger.warn('failed to persist exercise progress', { labId, exerciseId, error: error.message })
    return { success: false, error: 'Failed to save practice session.' }
  }

  return { success: true }
}
