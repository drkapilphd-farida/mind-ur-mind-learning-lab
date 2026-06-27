'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { SignInSchema } from '../types'

export async function signIn(
  input: unknown,
  next: string = '/dashboard',
): Promise<{ success: false; error: string }> {
  const parsed = SignInSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: 'Please enter a valid email and password.' }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  })

  if (error) {
    return { success: false, error: error.message }
  }

  redirect(next)
}
