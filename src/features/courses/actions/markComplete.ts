'use server'

import { createClient } from '@/lib/supabase/server'
import type { AuthActionResult } from '@/features/auth/types'

export async function markComplete(
  lessonId: string,
  completed: boolean,
): Promise<AuthActionResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { success: false, error: 'Not authenticated.' }

  if (completed) {
    const { error } = await supabase
      .from('lesson_completions')
      .insert({ user_id: user.id, lesson_id: lessonId })

    // 23505 = unique violation; already completed is fine
    if (error && error.code !== '23505') {
      return { success: false, error: 'Failed to mark lesson complete.' }
    }
  } else {
    const { error } = await supabase
      .from('lesson_completions')
      .delete()
      .eq('user_id', user.id)
      .eq('lesson_id', lessonId)

    if (error) {
      return { success: false, error: 'Failed to update lesson status.' }
    }
  }

  return { success: true }
}
