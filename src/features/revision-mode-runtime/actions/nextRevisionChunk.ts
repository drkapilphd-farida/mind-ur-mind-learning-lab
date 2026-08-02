'use server'

import { continueRuntime } from '@/core/adaptive-learning-runtime'
import { runRevisionSessionDecision } from './runRevisionSessionDecision'
import { SessionIdSchema } from '@/features/learning-mode-runtime'
import type { ModeSessionActionResult } from '@/features/learning-mode-runtime'

// Revision Mode™ Sprint ALS-17. Navigation — Next. A thin wrapper naming
// which real LSE-2 decision this action applies, mirroring Memory Mode™'s
// own `nextMemoryChunk.ts`.
export async function nextRevisionChunk(input: unknown): Promise<ModeSessionActionResult> {
  const parsed = SessionIdSchema.safeParse(input)
  if (!parsed.success) return { success: false, error: 'Invalid revision session request.' }

  return runRevisionSessionDecision(parsed.data, (runtime, ulo) => continueRuntime(runtime, ulo))
}
