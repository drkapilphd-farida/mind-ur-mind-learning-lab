'use server'

import { pauseRuntime } from '@/core/adaptive-learning-runtime'
import { runSmartNotesSessionDecision } from './runSmartNotesSessionDecision'
import { SessionIdSchema } from '@/features/learning-mode-runtime'
import type { ModeSessionActionResult } from '@/features/learning-mode-runtime'

// Smart Notes™ Sprint-1. A thin wrapper naming which real LSE-2 decision
// this action applies, mirroring Memory Mode™'s own
// `pauseMemorySession.ts`.
export async function pauseSmartNotesSession(input: unknown): Promise<ModeSessionActionResult> {
  const parsed = SessionIdSchema.safeParse(input)
  if (!parsed.success) return { success: false, error: 'Invalid smart notes session request.' }

  return runSmartNotesSessionDecision(parsed.data, (runtime) => pauseRuntime(runtime))
}
