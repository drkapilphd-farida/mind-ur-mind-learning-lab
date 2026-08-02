'use server'

import { completeRuntime } from '@/core/adaptive-learning-runtime'
import { runRevisionSessionDecision } from './runRevisionSessionDecision'
import { SessionIdSchema } from '@/features/learning-mode-runtime'
import type { ModeSessionActionResult } from '@/features/learning-mode-runtime'

// Revision Mode™ Sprint ALS-17. Navigation — Finish. A thin wrapper
// naming which real LSE-2 decision this action applies, mirroring Memory
// Mode™'s own `finishMemorySession.ts`.
export async function finishRevisionSession(input: unknown): Promise<ModeSessionActionResult> {
  const parsed = SessionIdSchema.safeParse(input)
  if (!parsed.success) return { success: false, error: 'Invalid revision session request.' }

  return runRevisionSessionDecision(parsed.data, (runtime, ulo) => completeRuntime(runtime, ulo))
}
