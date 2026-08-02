'use server'

import { continueRuntime } from '@/core/adaptive-learning-runtime'
import { runMcqsSessionDecision } from './runMcqsSessionDecision'
import { SessionIdSchema } from '@/features/learning-mode-runtime'
import type { ModeSessionActionResult } from '@/features/learning-mode-runtime'

// MCQs™ Sprint ALS-17. Navigation — Next. A thin wrapper naming which
// real LSE-2 decision this action applies, mirroring Focus Mode™'s own
// `nextFocusChunk.ts`.
export async function nextMcqsChunk(input: unknown): Promise<ModeSessionActionResult> {
  const parsed = SessionIdSchema.safeParse(input)
  if (!parsed.success) return { success: false, error: 'Invalid MCQs session request.' }

  return runMcqsSessionDecision(parsed.data, (runtime, ulo) => continueRuntime(runtime, ulo))
}
