'use server'

import { IntelligentReadingSessionInputSchema } from '../types/schemas'
import type { IntelligentReadingSessionResult } from '../types/IntelligentReadingSessionResult'
import { loadIntelligentReadingContext } from './internal/loadIntelligentReadingContext'
import { resolveSessionForContext, persistAndRespond } from './internal/resolveIntelligentReadingSession'
import { recordReadingSpeedSample } from './recordReadingSpeedSample'

// Reading Intelligence Engine™ Upgrade — Sprint-4. Marks this chapter's
// Reading Session complete regardless of exactly which stage the reader
// was on (an explicit "Finish" always honors the reader's own real
// intent, mirroring the classic mode's own `finishReadingSession`). Also
// records a real completion row on the existing `qsr_reading_speed_samples`
// table (`wpm: null`, the same honest "this happened, no WPM applies"
// pattern Presence Reading/Guided Eye Flow/Comprehension Check already
// use) — so this new mode's completions count toward real "Today's
// Sessions"/streak figures the same as every other real mode.
export async function finishIntelligentReadingSession(input: unknown): Promise<IntelligentReadingSessionResult> {
  const parsed = IntelligentReadingSessionInputSchema.safeParse(input)
  if (!parsed.success) return { success: false, error: 'Invalid reading session request.' }

  const contextResult = await loadIntelligentReadingContext(parsed.data.documentId, parsed.data.chapterOrder)
  if (!contextResult.success) return { success: false, error: contextResult.error }

  const resolved = resolveSessionForContext(contextResult.context)
  const totalStages = resolved.session.stages.length
  const completedStageIds = resolved.session.stages.map((stage) => stage.stageId)

  const result = await persistAndRespond(contextResult.context, parsed.data.documentId, parsed.data.chapterOrder, {
    ...resolved,
    paused: false,
    progress: { currentStageIndex: totalStages, completedStageIds, status: 'completed' },
  })

  if (result.success) void recordReadingSpeedSample({ documentId: parsed.data.documentId, mode: 'intelligent-reading', wpm: null })

  return result
}
