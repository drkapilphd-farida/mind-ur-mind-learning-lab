'use server'

import { pauseRuntime } from '@/core/adaptive-learning-runtime'
import { runMemorySessionDecision } from './runMemorySessionDecision'
import { SessionIdSchema } from '@/features/learning-mode-runtime'
import type { ModeSessionActionResult } from '@/features/learning-mode-runtime'

// Memory Mode™ Sprint-1. A thin wrapper naming which real LSE-2 decision
// this action applies, mirroring Quantum Speed Reading™'s own
// `pauseReadingSession.ts`.
export async function pauseMemorySession(input: unknown): Promise<ModeSessionActionResult> {
  const parsed = SessionIdSchema.safeParse(input)
  if (!parsed.success) return { success: false, error: 'Invalid memory session request.' }

  return runMemorySessionDecision(parsed.data, (runtime) => pauseRuntime(runtime))
}
