'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'

// Mirrors saveReadingIntelligenceSession.ts's exact pattern — a separate,
// append-only record, never touching exercise_progress/practice_sessions
// or LabIdSchema.
const ImagePersistenceSessionInputSchema = z
  .object({
    imageUsed: z.string().min(1),
    durationSeconds: z.number().min(0),
    observationResponse: z.enum(['clearly-saw', 'noticed-details', 'light-patterns', 'nothing-yet']).nullable(),
    notes: z.string().max(2000).nullable(),
  })
  .strict()

export type ImagePersistenceSessionInput = z.infer<typeof ImagePersistenceSessionInputSchema>
export type ImagePersistenceSessionResult = { success: true } | { success: false; error: string }

export async function saveImagePersistenceSession(input: unknown): Promise<ImagePersistenceSessionResult> {
  const parsed = ImagePersistenceSessionInputSchema.safeParse(input)
  if (!parsed.success) {
    logger.warn('image persistence session input failed validation', { issues: parsed.error.issues })
    return { success: false, error: 'Invalid session data.' }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // This lab is reachable without signing in — no user means this session
  // simply isn't tracked for that visit, not a failure.
  if (!user) {
    return { success: true }
  }

  const { error } = await supabase.from('image_persistence_sessions').insert({
    user_id: user.id,
    image_used: parsed.data.imageUsed,
    duration_seconds: Math.round(parsed.data.durationSeconds),
    observation_response: parsed.data.observationResponse,
    notes: parsed.data.notes,
    completed: true,
  })

  if (error) {
    logger.warn('failed to log image persistence session', { error: error.message })
    return { success: false, error: 'Failed to save session.' }
  }

  return { success: true }
}
