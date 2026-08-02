'use server'

import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'
import { LeadCaptureInputSchema } from './leadCaptureSchema'

export type LeadCaptureActionResult = { success: true } | { success: false; error: string }

// Persists a lead-magnet submission for the 2-minute assessment flow.
// Reachable before sign-in by design — the whole point of this screen is
// to capture contact info for a visitor who has no account yet — so this
// never checks for a signed-in user. Row Level Security (not this
// function) is what actually keeps the `leads` table insert-only for the
// anon role; this Server Action's job is input validation and keeping
// the raw Supabase call off the client.
export async function submitLead(input: unknown): Promise<LeadCaptureActionResult> {
  const parsed = LeadCaptureInputSchema.safeParse(input)
  if (!parsed.success) {
    logger.warn('lead capture input failed validation', { issues: parsed.error.issues })
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Please check your details and try again.' }
  }

  const { fullName, whatsappNumber, readingWpm, memoryPercent, focusPercent } = parsed.data

  const supabase = await createClient()
  const { error } = await supabase.from('leads').insert({
    full_name: fullName,
    whatsapp_number: whatsappNumber,
    reading_wpm: readingWpm,
    memory_percent: memoryPercent,
    focus_percent: focusPercent,
  })

  if (error) {
    logger.warn('failed to save lead', { error: error.message })
    return { success: false, error: 'Something went wrong. Please try again.' }
  }

  return { success: true }
}
