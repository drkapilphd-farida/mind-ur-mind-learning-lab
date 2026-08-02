'use server'

import { resumeRuntime } from '@/core/adaptive-learning-runtime'
import { runMemorySessionDecision } from './runMemorySessionDecision'
import { SessionIdSchema } from '@/features/learning-mode-runtime'
import type { ModeSessionActionResult } from '@/features/learning-mode-runtime'

// Memory Mode™ Sprint-1. Session Recovery — "close browser, return
// later, continue automatically," mirroring Quantum Speed Reading™'s own
// `continueReadingSession.ts`. If the learner had explicitly paused
// before leaving, returning and choosing to continue genuinely resumes
// the runtime; if not, the current state is returned as a real, honest
// no-op.
export async function continueMemorySession(input: unknown): Promise<ModeSessionActionResult> {
  const parsed = SessionIdSchema.safeParse(input)
  if (!parsed.success) return { success: false, error: 'Invalid memory session request.' }

  return runMemorySessionDecision(parsed.data, (runtime) => (runtime.session.status === 'paused' ? resumeRuntime(runtime) : { success: true, state: runtime, events: [] }))
}
