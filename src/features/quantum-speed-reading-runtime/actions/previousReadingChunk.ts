'use server'

import { previousChunk } from '@/core/adaptive-learning-runtime'
import { runReadingSessionDecision } from './runReadingSessionDecision'
import { SessionIdSchema } from '../types/schemas'
import type { ReadingSessionActionResult } from '../types/ReadingSessionActionResult'

// Quantum Speed Reading™ Production Sprint-1. Navigation — Previous. A
// thin wrapper around LSE-2's own `previousChunk` — the one real decision
// added to the locked Adaptive Learning Runtime™ this sprint (see
// docs/PRODUCTION_HANDOFF_LSE_2.md's amendment section). All shared
// mechanics live in runReadingSessionDecision.ts.
export async function previousReadingChunk(input: unknown): Promise<ReadingSessionActionResult> {
  const parsed = SessionIdSchema.safeParse(input)
  if (!parsed.success) return { success: false, error: 'Invalid reading session request.' }

  return runReadingSessionDecision(parsed.data, (runtime, ulo) => previousChunk(runtime, ulo))
}
