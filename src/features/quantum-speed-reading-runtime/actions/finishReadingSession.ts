'use server'

import { completeRuntime } from '@/core/adaptive-learning-runtime'
import { runReadingSessionDecision } from './runReadingSessionDecision'
import { SessionIdSchema } from '../types/schemas'
import type { ReadingSessionActionResult } from '../types/ReadingSessionActionResult'

// Quantum Speed Reading™ Production Sprint-1. Navigation — Finish. A thin
// wrapper naming which real LSE-2 decision this action applies; all
// shared mechanics live in runReadingSessionDecision.ts.
export async function finishReadingSession(input: unknown): Promise<ReadingSessionActionResult> {
  const parsed = SessionIdSchema.safeParse(input)
  if (!parsed.success) return { success: false, error: 'Invalid reading session request.' }

  return runReadingSessionDecision(parsed.data, (runtime, ulo) => completeRuntime(runtime, ulo))
}
