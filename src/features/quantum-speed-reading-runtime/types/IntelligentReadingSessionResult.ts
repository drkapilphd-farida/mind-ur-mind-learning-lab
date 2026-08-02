import type { ReadingSession, ReadingSessionProgress } from '@/core/universal-learning-engine/reading-experience'

// Reading Intelligence Engine™ Upgrade — Sprint-4: Quantum Speed
// Reading™ Experience Integration. The one real result shape every
// "Intelligent Reading" Server Action returns — mirrors
// `ReadingSessionActionResult`'s own `{success, ...} | {success:false, error}`
// shape (this feature's own established convention), scoped to the new
// Reading Session-driven mode only.
export type IntelligentReadingSessionResult =
  | {
      success: true
      session: ReadingSession
      progress: ReadingSessionProgress
      paused: boolean
      chapterOrder: number
      totalChapters: number
    }
  | { success: false; error: string }

// Reading Journey Experience™ (Sprint-5) — the one additional real field
// `startIntelligentReadingSession` alone returns, once, at journey start:
// this chapter's own real original text (from the already-existing
// `LearningChunk.content` this codebase's classic QSR mode already reads
// via `loadUniversalLearningObject` — zero new AI, zero new pipeline,
// zero new table). Not part of `IntelligentReadingSessionResult` itself
// so the other four lifecycle actions (advance/pause/resume/finish) keep
// their existing, unextended shape — the text never changes across those
// calls, so there is no reason to keep re-sending it.
export type StartReadingJourneyResult = IntelligentReadingSessionResult & { chapterFullText?: string | null }
