'use server'

import { resumeRuntime } from '@/core/adaptive-learning-runtime'
import { runResearchSessionDecision } from './runResearchSessionDecision'
import { SessionIdSchema } from '@/features/learning-mode-runtime'
import type { ModeSessionActionResult } from '@/features/learning-mode-runtime'

// Research Mode™ — Production AI Integration (ALS-24). Session Recovery —
// "close browser, return later, continue automatically," mirroring
// Revision Mode™'s own `continueRevisionSession.ts`. If the learner had
// explicitly paused before leaving, returning and choosing to continue
// genuinely resumes the runtime; if not, the current state is returned as
// a real, honest no-op.
export async function continueResearchSession(input: unknown): Promise<ModeSessionActionResult> {
  const parsed = SessionIdSchema.safeParse(input)
  if (!parsed.success) return { success: false, error: 'Invalid research session request.' }

  return runResearchSessionDecision(parsed.data, (runtime) => (runtime.session.status === 'paused' ? resumeRuntime(runtime) : { success: true, state: runtime, events: [] }))
}
