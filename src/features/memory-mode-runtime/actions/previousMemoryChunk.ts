'use server'

import { previousChunk } from '@/core/adaptive-learning-runtime'
import { runMemorySessionDecision } from './runMemorySessionDecision'
import { SessionIdSchema } from '@/features/learning-mode-runtime'
import type { ModeSessionActionResult } from '@/features/learning-mode-runtime'

// Memory Mode™ Sprint-1. Navigation — Previous. A thin wrapper around
// LSE-2's own `previousChunk`, mirroring Quantum Speed Reading™'s own
// `previousReadingChunk.ts`.
export async function previousMemoryChunk(input: unknown): Promise<ModeSessionActionResult> {
  const parsed = SessionIdSchema.safeParse(input)
  if (!parsed.success) return { success: false, error: 'Invalid memory session request.' }

  return runMemorySessionDecision(parsed.data, (runtime, ulo) => previousChunk(runtime, ulo))
}
