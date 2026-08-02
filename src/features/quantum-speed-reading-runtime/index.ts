// Quantum Speed Reading™ Production Sprint-1 — the concrete, Supabase-
// backed engine behind the first real Learning Mode™. Everything under
// `src/core/` stays framework-agnostic per the Learning Mode Runtime
// Contract™ (LSE-5); this feature is where the reserved
// `SessionPersistenceAdapter` (LSE-3) gets its first real implementation,
// and where real Server Actions compose LSE-2/LSE-3/LSE-4's public
// barrels into the session lifecycle a future UI will call.
export { startReadingSession } from './actions/startReadingSession'
export { continueReadingSession } from './actions/continueReadingSession'
export { nextReadingChunk } from './actions/nextReadingChunk'
export { previousReadingChunk } from './actions/previousReadingChunk'
export { pauseReadingSession } from './actions/pauseReadingSession'
export { resumeReadingSession } from './actions/resumeReadingSession'
export { finishReadingSession } from './actions/finishReadingSession'
export { getReadingProgress } from './actions/getReadingProgress'

// Reading Intelligence Engine™ Upgrade — Sprint-4: Quantum Speed
// Reading™ Experience Integration. The new Reading Session-driven mode's
// own session-lifecycle actions — entirely additive, alongside the
// classic actions above (which remain completely unmodified).
export { startIntelligentReadingSession } from './actions/startIntelligentReadingSession'
export { advanceIntelligentReadingStage } from './actions/advanceIntelligentReadingStage'
export { pauseIntelligentReadingSession } from './actions/pauseIntelligentReadingSession'
export { resumeIntelligentReadingSession } from './actions/resumeIntelligentReadingSession'
export { finishIntelligentReadingSession } from './actions/finishIntelligentReadingSession'

export type { ReadingSessionActionResult, GetReadingProgressResult } from './types'
export type { IntelligentReadingSessionResult } from './types/IntelligentReadingSessionResult'
