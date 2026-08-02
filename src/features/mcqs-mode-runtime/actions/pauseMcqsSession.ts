'use server'

import { pauseRuntime } from '@/core/adaptive-learning-runtime'
import { runMcqsSessionDecision } from './runMcqsSessionDecision'
import { SessionIdSchema } from '@/features/learning-mode-runtime'
import type { ModeSessionActionResult } from '@/features/learning-mode-runtime'

// MCQs™ Sprint ALS-17. A thin wrapper naming which real LSE-2 decision
// this action applies, mirroring Focus Mode™'s own `pauseFocusSession.ts`.
export async function pauseMcqsSession(input: unknown): Promise<ModeSessionActionResult> {
  const parsed = SessionIdSchema.safeParse(input)
  if (!parsed.success) return { success: false, error: 'Invalid MCQs session request.' }

  return runMcqsSessionDecision(parsed.data, (runtime) => pauseRuntime(runtime))
}
