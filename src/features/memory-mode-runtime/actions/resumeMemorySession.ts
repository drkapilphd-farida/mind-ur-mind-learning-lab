'use server'

import { resumeRuntime } from '@/core/adaptive-learning-runtime'
import { runMemorySessionDecision } from './runMemorySessionDecision'
import { SessionIdSchema } from '@/features/learning-mode-runtime'
import type { ModeSessionActionResult } from '@/features/learning-mode-runtime'

// Memory Mode™ Sprint-1. Navigation — Resume: an explicit un-pause during
// the same visit, mirroring Quantum Speed Reading™'s own
// `resumeReadingSession.ts`. Distinct from `continueMemorySession.ts`
// (Session Recovery across visits) — calling "Resume" on a session that
// was never paused is a real caller error (LSE-2's own
// `invalid-transition`), surfaced honestly rather than silently absorbed.
export async function resumeMemorySession(input: unknown): Promise<ModeSessionActionResult> {
  const parsed = SessionIdSchema.safeParse(input)
  if (!parsed.success) return { success: false, error: 'Invalid memory session request.' }

  return runMemorySessionDecision(parsed.data, (runtime) => resumeRuntime(runtime))
}
