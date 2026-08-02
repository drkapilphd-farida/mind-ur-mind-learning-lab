import { z } from 'zod'

// Kept intentionally permissive — international WhatsApp numbers vary
// widely in length and separator style. This only rejects obvious
// non-phone-number input; it does not attempt to validate a specific
// country's format.
const WHATSAPP_NUMBER_PATTERN = /^[0-9+\-\s()]{7,20}$/

// Lives in its own plain module rather than inside submitLead.ts —
// a 'use server' file may only export async functions, so anything
// else exported from it (like this schema) silently breaks at the
// client/server boundary. Both the Server Action and the client-side
// form import this shared schema from here instead.
export const LeadCaptureInputSchema = z.object({
  fullName: z.string().trim().min(2, 'Please enter your full name.').max(100),
  whatsappNumber: z
    .string()
    .trim()
    .regex(WHATSAPP_NUMBER_PATTERN, 'Please enter a valid WhatsApp number.'),
  readingWpm: z.number().int().min(0),
  memoryPercent: z.number().int().min(0).max(100),
  focusPercent: z.number().int().min(0).max(100),
})

export type LeadCaptureInput = z.infer<typeof LeadCaptureInputSchema>
