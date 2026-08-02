'use server'

import { AdvanceIntelligentReadingStageInputSchema } from '../types/schemas'
import type { IntelligentReadingSessionResult } from '../types/IntelligentReadingSessionResult'
import { loadIntelligentReadingContext } from './internal/loadIntelligentReadingContext'
import { resolveSessionForContext, persistAndRespond } from './internal/resolveIntelligentReadingSession'

// Reading Intelligence Engine™ Upgrade — Sprint-4. Moves the reader's
// real progress marker one real stage forward or back through the
// Reading Session's own fixed six stages
// (word → phrase → sentence → paragraph → chapter → completion) — never
// regenerates the session's content, never calls Claude, only updates
// `currentStageIndex`/`completedStageIds`/`status`.
export async function advanceIntelligentReadingStage(input: unknown): Promise<IntelligentReadingSessionResult> {
  const parsed = AdvanceIntelligentReadingStageInputSchema.safeParse(input)
  if (!parsed.success) return { success: false, error: 'Invalid reading stage request.' }

  const contextResult = await loadIntelligentReadingContext(parsed.data.documentId, parsed.data.chapterOrder)
  if (!contextResult.success) return { success: false, error: contextResult.error }

  const resolved = resolveSessionForContext(contextResult.context)
  if (resolved.paused) return { success: false, error: 'Resume the session before continuing.' }

  const totalStages = resolved.session.stages.length
  const currentIndex = resolved.progress.currentStageIndex

  if (parsed.data.direction === 'previous') {
    if (currentIndex <= 0) return { success: false, error: 'Already at the first stage.' }
    const newIndex = currentIndex - 1
    const nextProgress = { currentStageIndex: newIndex, completedStageIds: resolved.progress.completedStageIds.filter((id) => id !== resolved.session.stages[newIndex]?.stageId), status: 'in-progress' as const }
    return persistAndRespond(contextResult.context, parsed.data.documentId, parsed.data.chapterOrder, { ...resolved, progress: nextProgress })
  }

  if (currentIndex >= totalStages) return { success: false, error: 'This reading session is already complete.' }

  const completingStage = resolved.session.stages[currentIndex]
  const newIndex = currentIndex + 1
  const completedStageIds = completingStage && !resolved.progress.completedStageIds.includes(completingStage.stageId) ? [...resolved.progress.completedStageIds, completingStage.stageId] : resolved.progress.completedStageIds
  const status = newIndex >= totalStages ? ('completed' as const) : ('in-progress' as const)

  return persistAndRespond(contextResult.context, parsed.data.documentId, parsed.data.chapterOrder, { ...resolved, progress: { currentStageIndex: newIndex, completedStageIds, status } })
}
