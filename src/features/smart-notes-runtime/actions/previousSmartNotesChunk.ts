'use server'

import { previousChunk } from '@/core/adaptive-learning-runtime'
import { runSmartNotesSessionDecision } from './runSmartNotesSessionDecision'
import { SessionIdSchema } from '@/features/learning-mode-runtime'
import type { ModeSessionActionResult } from '@/features/learning-mode-runtime'

// Smart Notes™ Sprint-1. Navigation — Previous. A thin wrapper around
// LSE-2's own `previousChunk`, mirroring Memory Mode™'s own
// `previousMemoryChunk.ts`.
export async function previousSmartNotesChunk(input: unknown): Promise<ModeSessionActionResult> {
  const parsed = SessionIdSchema.safeParse(input)
  if (!parsed.success) return { success: false, error: 'Invalid smart notes session request.' }

  return runSmartNotesSessionDecision(parsed.data, (runtime, ulo) => previousChunk(runtime, ulo))
}
