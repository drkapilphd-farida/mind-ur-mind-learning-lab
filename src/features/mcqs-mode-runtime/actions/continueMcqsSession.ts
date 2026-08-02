'use server'

import { resumeRuntime } from '@/core/adaptive-learning-runtime'
import { runMcqsSessionDecision } from './runMcqsSessionDecision'
import { SessionIdSchema } from '@/features/learning-mode-runtime'
import type { ModeSessionActionResult } from '@/features/learning-mode-runtime'

// MCQs™ Sprint ALS-17. Session Recovery — "close browser, return later,
// continue automatically," mirroring Focus Mode™'s own
// `continueFocusSession.ts`. If the learner had explicitly paused before
// leaving, returning and choosing to continue genuinely resumes the
// runtime; if not, the current state is returned as a real, honest no-op.
export async function continueMcqsSession(input: unknown): Promise<ModeSessionActionResult> {
  const parsed = SessionIdSchema.safeParse(input)
  if (!parsed.success) return { success: false, error: 'Invalid MCQs session request.' }

  return runMcqsSessionDecision(parsed.data, (runtime) => (runtime.session.status === 'paused' ? resumeRuntime(runtime) : { success: true, state: runtime, events: [] }))
}
