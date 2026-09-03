import { z } from 'zod'

// Kept intentionally permissive — same reasoning as
// leadCaptureSchema.ts's WHATSAPP_NUMBER_PATTERN: rejects obvious
// non-phone input without assuming one country's format.
const PHONE_PATTERN = /^[0-9+\-\s()]{7,20}$/

// Lives in its own plain module — a 'use server' file may only export
// async functions, so the schema (and its inferred type) has to live
// outside submitFranchiseLead.ts, same split as leadCaptureSchema.ts.
export const FranchiseLeadInputSchema = z.object({
  name: z.string().trim().min(2, 'Please enter your full name.').max(100),
  phone: z.string().trim().regex(PHONE_PATTERN, 'Please enter a valid phone number.'),
  city: z.string().trim().min(2, 'Please enter your city.').max(100),
  background: z.string().trim().max(1000).optional(),
  whyInterested: z.string().trim().max(1000).optional(),
})

export type FranchiseLeadInput = z.infer<typeof FranchiseLeadInputSchema>
