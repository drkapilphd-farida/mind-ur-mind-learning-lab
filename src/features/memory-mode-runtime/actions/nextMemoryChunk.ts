'use server'

import { continueRuntime } from '@/core/adaptive-learning-runtime'
import { runMemorySessionDecision } from './runMemorySessionDecision'
import { SessionIdSchema } from '@/features/learning-mode-runtime'
import type { ModeSessionActionResult } from '@/features/learning-mode-runtime'

// Memory Mode™ Sprint-1. Navigation — Next. A thin wrapper naming which
// real LSE-2 decision this action applies, mirroring Quantum Speed
// Reading™'s own `nextReadingChunk.ts`.
export async function nextMemoryChunk(input: unknown): Promise<ModeSessionActionResult> {
  const parsed = SessionIdSchema.safeParse(input)
  if (!parsed.success) return { success: false, error: 'Invalid memory session request.' }

  return runMemorySessionDecision(parsed.data, (runtime, ulo) => continueRuntime(runtime, ulo))
}
