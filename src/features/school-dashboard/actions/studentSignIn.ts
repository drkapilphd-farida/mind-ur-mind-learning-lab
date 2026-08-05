'use server'

import { redirect } from 'next/navigation'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { studentAuthEmailFor } from '../provisioning/generateUniqueCredentials'

const StudentSignInSchema = z.object({
  username: z.string().min(1, 'Please enter your username'),
  password: z.string().min(1, 'Password is required'),
})

// Mirrors signIn.ts exactly, with one difference: students never see or
// enter their synthetic @students.quantummind.internal email (see
// provisionStudentAccount.ts) — they enter the generated `username`,
// translated here to the real Auth-layer email before calling the same
// signInWithPassword every other account uses. No separate auth backend.
export async function studentSignIn(input: unknown): Promise<{ success: false; error: string }> {
  const parsed = StudentSignInSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: 'Please enter your username and password.' }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({
    email: studentAuthEmailFor(parsed.data.username.trim().toLowerCase()),
    password: parsed.data.password,
  })

  if (error) {
    return { success: false, error: 'Incorrect username or password.' }
  }

  redirect('/dashboard')
}
