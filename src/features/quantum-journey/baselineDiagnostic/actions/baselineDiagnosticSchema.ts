import { z } from 'zod'

// Lives in its own plain module rather than inside saveBaselineDiagnostic.ts
// — a 'use server' file may only export async functions, so anything else
// exported from it (like this schema) silently breaks at the client/server
// boundary (the same real bug class documented in dailyQuantumSessionSchema.ts).
export const BaselineDiagnosticInputSchema = z.object({
  rawWpm: z.number().int().min(0),
  // Explicitly tri-state — exactly 2 comprehension questions, so the only
  // honest values are 0/2, 1/2, or 2/2 correct.
  accuracyPercent: z.union([z.literal(0), z.literal(50), z.literal(100)]),
  trueBaselineWpm: z.number().int().min(0),
})

export type BaselineDiagnosticInput = z.infer<typeof BaselineDiagnosticInputSchema>
