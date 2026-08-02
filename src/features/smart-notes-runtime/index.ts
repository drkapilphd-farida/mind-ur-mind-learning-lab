// Smart Notes™ Sprint-1 — engine only. No UI polish, no Apple animations,
// no premium visuals, no AI generation, no summarization, no flashcards,
// no quizzes, no revision, no research, no mentor. Session lifecycle,
// navigation, progress, and persistence only, built entirely on the
// Shared Learning Runtime (`src/features/learning-mode-runtime/`) — the
// same one Quantum Speed Reading™ and Memory Mode™ use. No duplicate
// runtime, session engine, persistence, analytics, or AI pipeline.
export { startSmartNotesSession } from './actions/startSmartNotesSession'
export { continueSmartNotesSession } from './actions/continueSmartNotesSession'
export { nextSmartNotesChunk } from './actions/nextSmartNotesChunk'
export { previousSmartNotesChunk } from './actions/previousSmartNotesChunk'
export { pauseSmartNotesSession } from './actions/pauseSmartNotesSession'
export { resumeSmartNotesSession } from './actions/resumeSmartNotesSession'
export { finishSmartNotesSession } from './actions/finishSmartNotesSession'
export { getSmartNotesProgress } from './actions/getSmartNotesProgress'
export { findSmartNotesSessionForDocument } from './actions/findSmartNotesSessionForDocument'

export type { GetSmartNotesProgressResult } from './actions/getSmartNotesProgress'
export type { ModeSessionActionResult } from '@/features/learning-mode-runtime'
