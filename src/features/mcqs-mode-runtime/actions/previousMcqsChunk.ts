'use server'

import { previousChunk } from '@/core/adaptive-learning-runtime'
import { runMcqsSessionDecision } from './runMcqsSessionDecision'
import { SessionIdSchema } from '@/features/learning-mode-runtime'
import type { ModeSessionActionResult } from '@/features/learning-mode-runtime'

// MCQs™ Sprint ALS-17. Navigation — Previous. A thin wrapper around
// LSE-2's own `previousChunk`, mirroring Focus Mode™'s own
// `previousFocusChunk.ts`.
export async function previousMcqsChunk(input: unknown): Promise<ModeSessionActionResult> {
  const parsed = SessionIdSchema.safeParse(input)
  if (!parsed.success) return { success: false, error: 'Invalid MCQs session request.' }

  return runMcqsSessionDecision(parsed.data, (runtime, ulo) => previousChunk(runtime, ulo))
}
