import { generateReadingSession, type ReadingSession, type ReadingSessionProgress } from '@/core/universal-learning-engine/reading-experience'
import type { IntelligentReadingContext } from './loadIntelligentReadingContext'
import type { IntelligentReadingSessionResult } from '../../types/IntelligentReadingSessionResult'
import { saveReadingExperienceProgress, type ReadingExperienceProgressRecord } from '../../persistence/readingExperienceSessionRecord'

export type ResolvedIntelligentReadingSession = {
  session: ReadingSession
  progress: ReadingSessionProgress
  paused: boolean
  sessionId: string | null
}

// Reading Intelligence Engine™ Upgrade — Sprint-4. The Reading Session
// itself is never stored — it's a real, deterministic, ~free-to-recompute
// function of the already-real Bundle (`generateReadingSession`), so
// every action regenerates it fresh, then overlays the learner's own
// real, separately-persisted progress marker on top. A progress row
// saved against an older real Bundle `version` (the chapter's Blueprint —
// and therefore its Assets — genuinely changed since) is honestly
// discarded here rather than silently applied against content it no
// longer matches; the reader starts that chapter over, never a fabricated
// splice of old progress onto new content.
export function resolveSessionForContext(context: IntelligentReadingContext): ResolvedIntelligentReadingSession {
  const session = generateReadingSession(context.bundle)

  const existingRecord = context.existing?.record ?? null
  const isFreshForThisBundle = existingRecord !== null && existingRecord.bundleVersion === context.bundle.version

  return {
    session,
    progress: isFreshForThisBundle ? (existingRecord as ReadingExperienceProgressRecord).progress : session.progress,
    paused: isFreshForThisBundle ? (existingRecord as ReadingExperienceProgressRecord).paused : false,
    sessionId: isFreshForThisBundle ? (context.existing?.sessionId ?? null) : null,
  }
}

export async function persistAndRespond(
  context: IntelligentReadingContext,
  documentId: string,
  chapterOrder: number,
  resolved: ResolvedIntelligentReadingSession,
): Promise<IntelligentReadingSessionResult> {
  const record: ReadingExperienceProgressRecord = {
    documentId,
    chapterOrder,
    bundleVersion: context.bundle.version,
    progress: resolved.progress,
    paused: resolved.paused,
  }

  const savedSessionId = await saveReadingExperienceProgress(context.supabase, context.userId, resolved.sessionId, record)
  if (savedSessionId === null) return { success: false, error: 'We could not save your reading progress. Please try again.' }

  return { success: true, session: resolved.session, progress: resolved.progress, paused: resolved.paused, chapterOrder, totalChapters: context.totalChapters }
}
