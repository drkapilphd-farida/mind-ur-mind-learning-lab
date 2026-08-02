'use server'

import { completeRuntime } from '@/core/adaptive-learning-runtime'
import { runMcqsSessionDecision } from './runMcqsSessionDecision'
import { SessionIdSchema } from '@/features/learning-mode-runtime'
import type { ModeSessionActionResult } from '@/features/learning-mode-runtime'

// MCQs™ Sprint ALS-17. Navigation — Finish. A thin wrapper naming which
// real LSE-2 decision this action applies, mirroring Focus Mode™'s own
// `finishFocusSession.ts`.
export async function finishMcqsSession(input: unknown): Promise<ModeSessionActionResult> {
  const parsed = SessionIdSchema.safeParse(input)
  if (!parsed.success) return { success: false, error: 'Invalid MCQs session request.' }

  return runMcqsSessionDecision(parsed.data, (runtime, ulo) => completeRuntime(runtime, ulo))
}
