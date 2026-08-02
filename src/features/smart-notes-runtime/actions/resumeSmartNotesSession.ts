'use server'

import { resumeRuntime } from '@/core/adaptive-learning-runtime'
import { runSmartNotesSessionDecision } from './runSmartNotesSessionDecision'
import { SessionIdSchema } from '@/features/learning-mode-runtime'
import type { ModeSessionActionResult } from '@/features/learning-mode-runtime'

// Smart Notes™ Sprint-1. Navigation — Resume: an explicit un-pause during
// the same visit, mirroring Memory Mode™'s own `resumeMemorySession.ts`.
// Distinct from `continueSmartNotesSession.ts` (Session Recovery across
// visits) — calling "Resume" on a session that was never paused is a
// real caller error (LSE-2's own `invalid-transition`), surfaced
// honestly rather than silently absorbed.
export async function resumeSmartNotesSession(input: unknown): Promise<ModeSessionActionResult> {
  const parsed = SessionIdSchema.safeParse(input)
  if (!parsed.success) return { success: false, error: 'Invalid smart notes session request.' }

  return runSmartNotesSessionDecision(parsed.data, (runtime) => resumeRuntime(runtime))
}
