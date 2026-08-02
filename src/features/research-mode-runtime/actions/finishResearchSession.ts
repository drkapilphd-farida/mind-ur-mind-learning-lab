'use server'

import { completeRuntime } from '@/core/adaptive-learning-runtime'
import { runResearchSessionDecision } from './runResearchSessionDecision'
import { SessionIdSchema } from '@/features/learning-mode-runtime'
import type { ModeSessionActionResult } from '@/features/learning-mode-runtime'

// Research Mode™ — Production AI Integration (ALS-24). Navigation —
// Finish. A thin wrapper naming which real LSE-2 decision this action
// applies, mirroring Revision Mode™'s own `finishRevisionSession.ts`.
export async function finishResearchSession(input: unknown): Promise<ModeSessionActionResult> {
  const parsed = SessionIdSchema.safeParse(input)
  if (!parsed.success) return { success: false, error: 'Invalid research session request.' }

  return runResearchSessionDecision(parsed.data, (runtime, ulo) => completeRuntime(runtime, ulo))
}
