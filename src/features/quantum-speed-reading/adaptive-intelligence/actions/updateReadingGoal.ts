'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import type { AuthActionResult } from '@/features/auth/types'
import { isReadingGoalId } from '../goalCatalog'

const UpdateReadingGoalSchema = z.object({
  goalId: z.string().min(1),
})

// Mirrors updateProfile.ts's exact pattern — a single per-user preference
// written to profiles, never a new table. Users may change goals anytime.
export async function updateReadingGoal(input: unknown): Promise<AuthActionResult> {
  const parsed = UpdateReadingGoalSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid input.' }
  }

  if (!isReadingGoalId(parsed.data.goalId)) {
    return { success: false, error: 'Unknown reading goal.' }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { success: false, error: 'Not authenticated.' }

  const { error } = await supabase
    .from('profiles')
    .update({ selected_reading_goal: parsed.data.goalId })
    .eq('id', user.id)

  if (error) return { success: false, error: 'Failed to update reading goal.' }

  return { success: true }
}
