'use server'

import { resumeRuntime } from '@/core/adaptive-learning-runtime'
import { runResearchSessionDecision } from './runResearchSessionDecision'
import { SessionIdSchema } from '@/features/learning-mode-runtime'
import type { ModeSessionActionResult } from '@/features/learning-mode-runtime'

// Research Mode™ — Production AI Integration (ALS-24). Navigation —
// Resume: an explicit un-pause during the same visit, mirroring Revision
// Mode™'s own `resumeRevisionSession.ts`. Distinct from
// `continueResearchSession.ts` (Session Recovery across visits).
export async function resumeResearchSession(input: unknown): Promise<ModeSessionActionResult> {
  const parsed = SessionIdSchema.safeParse(input)
  if (!parsed.success) return { success: false, error: 'Invalid research session request.' }

  return runResearchSessionDecision(parsed.data, (runtime) => resumeRuntime(runtime))
}
