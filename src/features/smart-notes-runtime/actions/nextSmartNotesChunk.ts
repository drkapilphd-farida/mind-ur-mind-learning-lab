'use server'

import { continueRuntime } from '@/core/adaptive-learning-runtime'
import { runSmartNotesSessionDecision } from './runSmartNotesSessionDecision'
import { SessionIdSchema } from '@/features/learning-mode-runtime'
import type { ModeSessionActionResult } from '@/features/learning-mode-runtime'

// Smart Notes™ Sprint-1. Navigation — Next. A thin wrapper naming which
// real LSE-2 decision this action applies, mirroring Memory Mode™'s own
// `nextMemoryChunk.ts`.
export async function nextSmartNotesChunk(input: unknown): Promise<ModeSessionActionResult> {
  const parsed = SessionIdSchema.safeParse(input)
  if (!parsed.success) return { success: false, error: 'Invalid smart notes session request.' }

  return runSmartNotesSessionDecision(parsed.data, (runtime, ulo) => continueRuntime(runtime, ulo))
}
