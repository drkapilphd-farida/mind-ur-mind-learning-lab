'use server'

import { continueRuntime } from '@/core/adaptive-learning-runtime'
import { runResearchSessionDecision } from './runResearchSessionDecision'
import { SessionIdSchema } from '@/features/learning-mode-runtime'
import type { ModeSessionActionResult } from '@/features/learning-mode-runtime'

// Research Mode™ — Production AI Integration (ALS-24). Navigation — Next.
// A thin wrapper naming which real LSE-2 decision this action applies,
// mirroring Revision Mode™'s own `nextRevisionChunk.ts`.
export async function nextResearchChunk(input: unknown): Promise<ModeSessionActionResult> {
  const parsed = SessionIdSchema.safeParse(input)
  if (!parsed.success) return { success: false, error: 'Invalid research session request.' }

  return runResearchSessionDecision(parsed.data, (runtime, ulo) => continueRuntime(runtime, ulo))
}
