'use server'

import { continueRuntime } from '@/core/adaptive-learning-runtime'
import { runFocusSessionDecision } from './runFocusSessionDecision'
import { SessionIdSchema } from '@/features/learning-mode-runtime'
import type { ModeSessionActionResult } from '@/features/learning-mode-runtime'

// Focus Mode™ (Mini) Sprint ALS-16. Navigation — Next. A thin wrapper
// naming which real LSE-2 decision this action applies, mirroring Memory
// Mode™'s own `nextMemoryChunk.ts`.
export async function nextFocusChunk(input: unknown): Promise<ModeSessionActionResult> {
  const parsed = SessionIdSchema.safeParse(input)
  if (!parsed.success) return { success: false, error: 'Invalid focus session request.' }

  return runFocusSessionDecision(parsed.data, (runtime, ulo) => continueRuntime(runtime, ulo))
}
