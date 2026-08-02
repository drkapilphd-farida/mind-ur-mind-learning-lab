import { z } from 'zod'

// World-record-adjacent (not just "fast") — the honest ceiling for a
// timed-passage WPM figure. Real values from the current client-side
// formula and passage lengths should never get near this; it exists to
// reject obviously-forged or -impossible payloads, not to clamp genuine
// fast readers.
const MAX_PLAUSIBLE_WPM = 1000

// Lives in its own plain module rather than inside saveBaselineDiagnostic.ts
// — a 'use server' file may only export async functions, so anything else
// exported from it (like this schema) silently breaks at the client/server
// boundary (the same real bug class documented in dailyQuantumSessionSchema.ts).
//
// Both numeric fields are computed client-side (there's no server-recorded
// timer), so this schema is the only real backstop against a forged direct
// call to the server action — it can't verify the client told the truth
// about elapsed reading time, but it can reject values that are
// impossible on their face (over MAX_PLAUSIBLE_WPM) or internally
// inconsistent (trueBaselineWpm not actually derived from
// rawWpm × accuracyPercent, the one relationship the honest client always
// computes — see trueWpm.ts).
export const BaselineDiagnosticInputSchema = z
  .object({
    rawWpm: z.number().int().min(0).max(MAX_PLAUSIBLE_WPM),
    // Explicitly tri-state — exactly 2 comprehension questions, so the only
    // honest values are 0/2, 1/2, or 2/2 correct.
    accuracyPercent: z.union([z.literal(0), z.literal(50), z.literal(100)]),
    trueBaselineWpm: z.number().int().min(0).max(MAX_PLAUSIBLE_WPM),
  })
  .refine((data) => data.trueBaselineWpm === Math.round(data.rawWpm * (data.accuracyPercent / 100)), {
    message: 'trueBaselineWpm must equal rawWpm scaled by accuracyPercent.',
    path: ['trueBaselineWpm'],
  })

export type BaselineDiagnosticInput = z.infer<typeof BaselineDiagnosticInputSchema>
