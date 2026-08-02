'use server'

import { resumeRuntime } from '@/core/adaptive-learning-runtime'
import { runReadingSessionDecision } from './runReadingSessionDecision'
import { SessionIdSchema } from '../types/schemas'
import type { ReadingSessionActionResult } from '../types/ReadingSessionActionResult'

// Quantum Speed Reading™ Production Sprint-1. Navigation — Resume: an
// explicit un-pause during the same visit. Distinct from
// continueReadingSession.ts (Session Recovery across visits) — this one
// does not fall back to a no-op on a non-paused runtime; calling
// "Resume" on a session that was never paused is a real caller error
// (LSE-2's own `invalid-transition`), surfaced honestly rather than
// silently absorbed.
export async function resumeReadingSession(input: unknown): Promise<ReadingSessionActionResult> {
  const parsed = SessionIdSchema.safeParse(input)
  if (!parsed.success) return { success: false, error: 'Invalid reading session request.' }

  return runReadingSessionDecision(parsed.data, (runtime) => resumeRuntime(runtime))
}
