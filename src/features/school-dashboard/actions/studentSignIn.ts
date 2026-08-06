'use server'

import { redirect } from 'next/navigation'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { checkRateLimit, getClientIp } from '@/lib/rateLimit'
import { studentAuthEmailFor } from '../provisioning/generateUniqueCredentials'

const StudentSignInSchema = z.object({
  username: z.string().min(1, 'Please enter your username'),
  password: z.string().min(1, 'Password is required'),
})

// Usernames are more guessable than a random email, so brute-forcing a
// generated password here is the more realistic risk — same per-IP
// budget as the other sign-in variants.
const STUDENT_SIGN_IN_RATE_LIMIT = { max: 10, windowMs: 60_000 }

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

  const clientIp = await getClientIp()
  if (!checkRateLimit(`student-sign-in:${clientIp}`, STUDENT_SIGN_IN_RATE_LIMIT).allowed) {
    return { success: false, error: 'Too many sign-in attempts. Please wait a moment and try again.' }
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
