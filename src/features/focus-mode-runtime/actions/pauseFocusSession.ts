'use server'

import { pauseRuntime } from '@/core/adaptive-learning-runtime'
import { runFocusSessionDecision } from './runFocusSessionDecision'
import { SessionIdSchema } from '@/features/learning-mode-runtime'
import type { ModeSessionActionResult } from '@/features/learning-mode-runtime'

// Focus Mode™ (Mini) Sprint ALS-16. A thin wrapper naming which real
// LSE-2 decision this action applies, mirroring Memory Mode™'s own
// `pauseMemorySession.ts`. Pomodoro Mode's own client-side break-cycling
// calls this same real action automatically when a work interval ends —
// no second, competing pause mechanic exists for that case.
export async function pauseFocusSession(input: unknown): Promise<ModeSessionActionResult> {
  const parsed = SessionIdSchema.safeParse(input)
  if (!parsed.success) return { success: false, error: 'Invalid focus session request.' }

  return runFocusSessionDecision(parsed.data, (runtime) => pauseRuntime(runtime))
}
