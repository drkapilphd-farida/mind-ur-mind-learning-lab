'use server'

import { previousChunk } from '@/core/adaptive-learning-runtime'
import { runFocusSessionDecision } from './runFocusSessionDecision'
import { SessionIdSchema } from '@/features/learning-mode-runtime'
import type { ModeSessionActionResult } from '@/features/learning-mode-runtime'

// Focus Mode™ (Mini) Sprint ALS-16. Navigation — Previous. A thin wrapper
// around LSE-2's own `previousChunk`, mirroring Memory Mode™'s own
// `previousMemoryChunk.ts`.
export async function previousFocusChunk(input: unknown): Promise<ModeSessionActionResult> {
  const parsed = SessionIdSchema.safeParse(input)
  if (!parsed.success) return { success: false, error: 'Invalid focus session request.' }

  return runFocusSessionDecision(parsed.data, (runtime, ulo) => previousChunk(runtime, ulo))
}
