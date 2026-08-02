import { z } from 'zod'

// Lives in its own plain module rather than inside saveQuantumDocumentSession.ts
// — a 'use server' file may only export async functions, so anything else
// exported from it (like this schema) silently breaks at the client/server
// boundary (the same real bug caught and fixed earlier building
// LeadCaptureModal, and the same reason dailyQuantumSessionSchema.ts is
// its own file).
export const QuantumDocumentSessionInputSchema = z
  .object({
    quantumDocumentId: z.string().uuid(),
    correctAnswersCount: z.number().int().min(0),
    totalQuestionsCount: z.number().int().min(1),
  })
  .refine((data) => data.correctAnswersCount <= data.totalQuestionsCount, {
    message: 'correctAnswersCount cannot exceed totalQuestionsCount',
    path: ['correctAnswersCount'],
  })

export type QuantumDocumentSessionInput = z.infer<typeof QuantumDocumentSessionInputSchema>
