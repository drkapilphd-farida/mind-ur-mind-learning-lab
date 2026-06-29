'use server'

import { logger } from '@/lib/logger'
import { PracticeSessionInputSchema, type PracticeSessionResult } from '../types'

// Placeholder only — no `practice_sessions` table exists yet (see roadmap S8/S9).
// Lives here, not inside a feature, so every lab can call the same action.
export async function savePracticeSession(input: unknown): Promise<PracticeSessionResult> {
  const parsed = PracticeSessionInputSchema.safeParse(input)
  if (!parsed.success) {
    logger.warn('practice session input failed validation', { issues: parsed.error.issues })
    return { success: false, error: 'Invalid practice session data.' }
  }

  logger.info('practice session recorded (placeholder, not yet persisted)', parsed.data)

  return { success: true }
}
