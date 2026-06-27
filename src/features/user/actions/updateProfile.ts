'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import type { AuthActionResult } from '@/features/auth/types'

const UpdateProfileSchema = z.object({
  fullName: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be 100 characters or fewer'),
})

export async function updateProfile(input: unknown): Promise<AuthActionResult> {
  const parsed = UpdateProfileSchema.safeParse(input)
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? 'Invalid input.',
    }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { success: false, error: 'Not authenticated.' }

  const { error } = await supabase
    .from('profiles')
    .update({ full_name: parsed.data.fullName })
    .eq('id', user.id)

  if (error) return { success: false, error: 'Failed to update profile.' }

  return { success: true }
}
