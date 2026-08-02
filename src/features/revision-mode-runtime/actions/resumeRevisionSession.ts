'use server'

import { resumeRuntime } from '@/core/adaptive-learning-runtime'
import { runRevisionSessionDecision } from './runRevisionSessionDecision'
import { SessionIdSchema } from '@/features/learning-mode-runtime'
import type { ModeSessionActionResult } from '@/features/learning-mode-runtime'

// Revision Mode™ Sprint ALS-17. Navigation — Resume: an explicit un-pause
// during the same visit, mirroring Memory Mode™'s own
// `resumeMemorySession.ts`. Distinct from `continueRevisionSession.ts`
// (Session Recovery across visits).
export async function resumeRevisionSession(input: unknown): Promise<ModeSessionActionResult> {
  const parsed = SessionIdSchema.safeParse(input)
  if (!parsed.success) return { success: false, error: 'Invalid revision session request.' }

  return runRevisionSessionDecision(parsed.data, (runtime) => resumeRuntime(runtime))
}
