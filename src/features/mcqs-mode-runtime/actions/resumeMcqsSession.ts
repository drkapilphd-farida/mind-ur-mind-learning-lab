'use server'

import { resumeRuntime } from '@/core/adaptive-learning-runtime'
import { runMcqsSessionDecision } from './runMcqsSessionDecision'
import { SessionIdSchema } from '@/features/learning-mode-runtime'
import type { ModeSessionActionResult } from '@/features/learning-mode-runtime'

// MCQs™ Sprint ALS-17. Navigation — Resume: an explicit un-pause during
// the same visit, mirroring Focus Mode™'s own `resumeFocusSession.ts`.
// Distinct from `continueMcqsSession.ts` (Session Recovery across visits).
export async function resumeMcqsSession(input: unknown): Promise<ModeSessionActionResult> {
  const parsed = SessionIdSchema.safeParse(input)
  if (!parsed.success) return { success: false, error: 'Invalid MCQs session request.' }

  return runMcqsSessionDecision(parsed.data, (runtime) => resumeRuntime(runtime))
}
