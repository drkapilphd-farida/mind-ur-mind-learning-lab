'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'

// Mirrors saveImagePersistenceSession.ts's exact pattern — a separate,
// append-only record, never touching Reading Intelligence Lab's tables,
// the progression system, or LabIdSchema.
const VisualPreparationSessionInputSchema = z
  .object({
    durationSeconds: z.number().min(0),
  })
  .strict()

export type VisualPreparationSessionInput = z.infer<typeof VisualPreparationSessionInputSchema>
export type VisualPreparationSessionResult = { success: true } | { success: false; error: string }

export async function saveVisualPreparationSession(input: unknown): Promise<VisualPreparationSessionResult> {
  const parsed = VisualPreparationSessionInputSchema.safeParse(input)
  if (!parsed.success) {
    logger.warn('visual preparation session input failed validation', { issues: parsed.error.issues })
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

  const { error } = await supabase.from('visual_preparation_sessions').insert({
    user_id: user.id,
    duration_seconds: Math.round(parsed.data.durationSeconds),
    completed: true,
  })

  if (error) {
    logger.warn('failed to log visual preparation session', { error: error.message })
    return { success: false, error: 'Failed to save session.' }
  }

  return { success: true }
}
