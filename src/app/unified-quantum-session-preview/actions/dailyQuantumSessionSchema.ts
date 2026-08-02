import { z } from 'zod'

// Lives in its own plain module rather than inside saveDailyQuantumSession.ts
// — a 'use server' file may only export async functions, so anything else
// exported from it (like this schema) silently breaks at the client/server
// boundary (the exact bug caught and fixed earlier building LeadCaptureModal).
export const DailyQuantumSessionInputSchema = z.object({
  readingWpm: z.number().int().min(0),
  accuracyPercent: z.number().int().min(0).max(100),
  readingScore: z.number().int().min(0).max(100),
  xpEarned: z.number().int().min(0),
})

export type DailyQuantumSessionInput = z.infer<typeof DailyQuantumSessionInputSchema>
