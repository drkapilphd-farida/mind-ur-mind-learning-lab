'use server'

import { completeRuntime } from '@/core/adaptive-learning-runtime'
import { runFocusSessionDecision } from './runFocusSessionDecision'
import { SessionIdSchema } from '@/features/learning-mode-runtime'
import type { ModeSessionActionResult } from '@/features/learning-mode-runtime'

// Focus Mode™ (Mini) Sprint ALS-16. Navigation — Finish. A thin wrapper
// naming which real LSE-2 decision this action applies, mirroring Memory
// Mode™'s own `finishMemorySession.ts`.
export async function finishFocusSession(input: unknown): Promise<ModeSessionActionResult> {
  const parsed = SessionIdSchema.safeParse(input)
  if (!parsed.success) return { success: false, error: 'Invalid focus session request.' }

  return runFocusSessionDecision(parsed.data, (runtime, ulo) => completeRuntime(runtime, ulo))
}
