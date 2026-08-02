'use server'

import { resumeRuntime } from '@/core/adaptive-learning-runtime'
import { runReadingSessionDecision } from './runReadingSessionDecision'
import { SessionIdSchema } from '../types/schemas'
import type { ReadingSessionActionResult } from '../types/ReadingSessionActionResult'

// Quantum Speed Reading™ Production Sprint-1. Session Recovery —
// "close browser, return later, continue automatically." The real
// recovery mechanics (load the real persisted snapshot, restore the real
// runtime from it via LSE-3's replay-based `restoreFromSnapshot`) already
// happen for every action in `runReadingSessionDecision`, not only this
// one. This action's own distinct, real contribution: if the learner had
// explicitly paused before leaving, returning and choosing to continue
// should genuinely resume the runtime; if they had not (the ordinary
// "just closed the tab mid-chunk" case), there is nothing to resume, and
// the current state is returned as a real, honest no-op — never an error
// for what is, from the learner's point of view, the same request either
// way.
export async function continueReadingSession(input: unknown): Promise<ReadingSessionActionResult> {
  const parsed = SessionIdSchema.safeParse(input)
  if (!parsed.success) return { success: false, error: 'Invalid reading session request.' }

  return runReadingSessionDecision(parsed.data, (runtime) => (runtime.session.status === 'paused' ? resumeRuntime(runtime) : { success: true, state: runtime, events: [] }))
}
