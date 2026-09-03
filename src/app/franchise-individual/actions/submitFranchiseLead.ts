'use server'

import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'
import { sendFranchiseLeadNotification } from '@/lib/email/sendFranchiseLeadNotification'
import { FranchiseLeadInputSchema } from './franchiseLeadSchema'

export type SubmitFranchiseLeadResult = { success: true } | { success: false; error: string }

// Reachable before sign-in by design — a prospective franchisee has no
// account yet. Row Level Security (franchise_leads_insert_anonymous),
// not this function, is what actually keeps the table insert-only for
// the anon role; this Server Action's job is input validation and
// keeping the raw Supabase call off the client, same division of
// responsibility as submitLead.ts.
//
// The email notification is genuinely best-effort: the lead is
// considered saved successfully the moment the database insert
// succeeds, regardless of whether the email step that follows works —
// see sendFranchiseLeadNotification.ts for why it never throws.
export async function submitFranchiseLead(input: unknown): Promise<SubmitFranchiseLeadResult> {
  const parsed = FranchiseLeadInputSchema.safeParse(input)
  if (!parsed.success) {
    logger.warn('[franchise-leads] submit input failed validation', { issues: parsed.error.issues })
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Please check your details and try again.' }
  }

  const { name, phone, city, background, whyInterested } = parsed.data

  const supabase = await createClient()
  const { error } = await supabase.from('franchise_leads').insert({
    name,
    phone,
    city,
    background: background ?? null,
    why_interested: whyInterested ?? null,
  })

  if (error) {
    logger.warn('[franchise-leads] failed to save lead', { error: error.message })
    return { success: false, error: 'Something went wrong. Please try again.' }
  }

  await sendFranchiseLeadNotification({ name, phone, city, background: background ?? null, whyInterested: whyInterested ?? null })

  return { success: true }
}
