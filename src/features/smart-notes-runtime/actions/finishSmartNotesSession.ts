'use server'

import { completeRuntime } from '@/core/adaptive-learning-runtime'
import { runSmartNotesSessionDecision } from './runSmartNotesSessionDecision'
import { SessionIdSchema } from '@/features/learning-mode-runtime'
import type { ModeSessionActionResult } from '@/features/learning-mode-runtime'

// Smart Notes™ Sprint-1. Navigation — Finish. A thin wrapper naming
// which real LSE-2 decision this action applies, mirroring Memory
// Mode™'s own `finishMemorySession.ts`.
export async function finishSmartNotesSession(input: unknown): Promise<ModeSessionActionResult> {
  const parsed = SessionIdSchema.safeParse(input)
  if (!parsed.success) return { success: false, error: 'Invalid smart notes session request.' }

  return runSmartNotesSessionDecision(parsed.data, (runtime, ulo) => completeRuntime(runtime, ulo))
}
