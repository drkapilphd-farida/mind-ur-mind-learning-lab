'use server'

import { previousChunk } from '@/core/adaptive-learning-runtime'
import { runResearchSessionDecision } from './runResearchSessionDecision'
import { SessionIdSchema } from '@/features/learning-mode-runtime'
import type { ModeSessionActionResult } from '@/features/learning-mode-runtime'

// Research Mode™ — Production AI Integration (ALS-24). Navigation —
// Previous. A thin wrapper around LSE-2's own `previousChunk`, mirroring
// Revision Mode™'s own `previousRevisionChunk.ts`.
export async function previousResearchChunk(input: unknown): Promise<ModeSessionActionResult> {
  const parsed = SessionIdSchema.safeParse(input)
  if (!parsed.success) return { success: false, error: 'Invalid research session request.' }

  return runResearchSessionDecision(parsed.data, (runtime, ulo) => previousChunk(runtime, ulo))
}
