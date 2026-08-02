'use server'

import { resumeRuntime } from '@/core/adaptive-learning-runtime'
import { runRevisionSessionDecision } from './runRevisionSessionDecision'
import { SessionIdSchema } from '@/features/learning-mode-runtime'
import type { ModeSessionActionResult } from '@/features/learning-mode-runtime'

// Revision Mode™ Sprint ALS-17. Session Recovery — "close browser, return
// later, continue automatically," mirroring Memory Mode™'s own
// `continueMemorySession.ts`. If the learner had explicitly paused before
// leaving, returning and choosing to continue genuinely resumes the
// runtime; if not, the current state is returned as a real, honest no-op.
export async function continueRevisionSession(input: unknown): Promise<ModeSessionActionResult> {
  const parsed = SessionIdSchema.safeParse(input)
  if (!parsed.success) return { success: false, error: 'Invalid revision session request.' }

  return runRevisionSessionDecision(parsed.data, (runtime) => (runtime.session.status === 'paused' ? resumeRuntime(runtime) : { success: true, state: runtime, events: [] }))
}
