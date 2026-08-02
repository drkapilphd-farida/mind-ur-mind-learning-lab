'use server'

import { resumeRuntime } from '@/core/adaptive-learning-runtime'
import { runFocusSessionDecision } from './runFocusSessionDecision'
import { SessionIdSchema } from '@/features/learning-mode-runtime'
import type { ModeSessionActionResult } from '@/features/learning-mode-runtime'

// Focus Mode™ (Mini) Sprint ALS-16. Session Recovery — "close browser,
// return later, continue automatically," mirroring Memory Mode™'s own
// `continueMemorySession.ts`. If the learner had explicitly paused (or a
// Pomodoro break auto-paused the session) before leaving, returning and
// choosing to continue genuinely resumes the runtime; if not, the current
// state is returned as a real, honest no-op.
export async function continueFocusSession(input: unknown): Promise<ModeSessionActionResult> {
  const parsed = SessionIdSchema.safeParse(input)
  if (!parsed.success) return { success: false, error: 'Invalid focus session request.' }

  return runFocusSessionDecision(parsed.data, (runtime) => (runtime.session.status === 'paused' ? resumeRuntime(runtime) : { success: true, state: runtime, events: [] }))
}
