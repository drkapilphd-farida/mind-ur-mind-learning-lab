'use server'

import { resumeRuntime } from '@/core/adaptive-learning-runtime'
import { runFocusSessionDecision } from './runFocusSessionDecision'
import { SessionIdSchema } from '@/features/learning-mode-runtime'
import type { ModeSessionActionResult } from '@/features/learning-mode-runtime'

// Focus Mode™ (Mini) Sprint ALS-16. Navigation — Resume: an explicit
// un-pause during the same visit, mirroring Memory Mode™'s own
// `resumeMemorySession.ts`. Distinct from `continueFocusSession.ts`
// (Session Recovery across visits). Pomodoro Mode's own client-side
// break-cycling calls this same real action automatically when a break
// interval ends.
export async function resumeFocusSession(input: unknown): Promise<ModeSessionActionResult> {
  const parsed = SessionIdSchema.safeParse(input)
  if (!parsed.success) return { success: false, error: 'Invalid focus session request.' }

  return runFocusSessionDecision(parsed.data, (runtime) => resumeRuntime(runtime))
}
