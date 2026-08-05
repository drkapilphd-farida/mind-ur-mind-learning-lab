import { randomInt } from 'node:crypto'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/types'
import { slugify } from './slugify'

export { slugify }

// Ambiguous characters (0/O, 1/l/I) excluded so a hand-copied credential
// from the printed sheet is never misread.
const PASSWORD_ALPHABET = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789'
const PASSWORD_LENGTH = 8
const MAX_USERNAME_ATTEMPTS = 5

// Generic random-password generator — used for both student and school-
// admin account provisioning (same security posture, same one-time-shown
// convention either way).
export function generateSecurePassword(): string {
  let password = ''
  for (let i = 0; i < PASSWORD_LENGTH; i += 1) {
    password += PASSWORD_ALPHABET[randomInt(0, PASSWORD_ALPHABET.length)]
  }
  return password
}

// Builds a globally-unique login username of the form
// "{schoolSlug}.{classSlug}.{handle}", retrying with a numeric suffix on
// collision (checked against the real unique index, not guessed).
export async function generateUniqueUsername(
  supabase: SupabaseClient<Database>,
  input: { schoolSlug: string; classSlug: string; fullName: string },
): Promise<{ success: true; username: string } | { success: false; error: string }> {
  const base = `${slugify(input.schoolSlug)}.${slugify(input.classSlug)}.${slugify(input.fullName)}`

  for (let attempt = 0; attempt < MAX_USERNAME_ATTEMPTS; attempt += 1) {
    const candidate = attempt === 0 ? base : `${base}${attempt + 1}`
    const { data, error } = await supabase
      .from('school_members')
      .select('id')
      .eq('username', candidate)
      .maybeSingle()

    if (error) {
      return { success: false, error: error.message }
    }
    if (data === null) {
      return { success: true, username: candidate }
    }
  }

  return { success: false, error: 'Could not generate a unique username. Try a different name.' }
}

export function studentAuthEmailFor(username: string): string {
  return `${username}@students.quantummind.internal`
}
