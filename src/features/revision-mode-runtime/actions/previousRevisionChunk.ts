'use server'

import { previousChunk } from '@/core/adaptive-learning-runtime'
import { runRevisionSessionDecision } from './runRevisionSessionDecision'
import { SessionIdSchema } from '@/features/learning-mode-runtime'
import type { ModeSessionActionResult } from '@/features/learning-mode-runtime'

// Revision Mode™ Sprint ALS-17. Navigation — Previous. A thin wrapper
// around LSE-2's own `previousChunk`, mirroring Memory Mode™'s own
// `previousMemoryChunk.ts`.
export async function previousRevisionChunk(input: unknown): Promise<ModeSessionActionResult> {
  const parsed = SessionIdSchema.safeParse(input)
  if (!parsed.success) return { success: false, error: 'Invalid revision session request.' }

  return runRevisionSessionDecision(parsed.data, (runtime, ulo) => previousChunk(runtime, ulo))
}
