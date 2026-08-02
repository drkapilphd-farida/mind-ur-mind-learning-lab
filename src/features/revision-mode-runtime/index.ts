// Revision Mode™ — AI Learning Studio™ Sprint ALS-17 — engine only. No
// Personalized Revision™, no Adaptive Learning™, no AI Brain Profiling™.
// Session lifecycle, navigation, progress, and persistence only, built
// entirely on the Shared Learning Runtime
// (`src/features/learning-mode-runtime/`) — the same one every other real
// Learning Mode uses. No duplicate runtime, session engine, persistence,
// or AI pipeline. `getDocumentRevisionContext` is the one real addition
// beyond the standard session lifecycle — a read-only, cross-session
// history summary, never used to alter scheduling.
export { startRevisionSession } from './actions/startRevisionSession'
export { continueRevisionSession } from './actions/continueRevisionSession'
export { nextRevisionChunk } from './actions/nextRevisionChunk'
export { previousRevisionChunk } from './actions/previousRevisionChunk'
export { pauseRevisionSession } from './actions/pauseRevisionSession'
export { resumeRevisionSession } from './actions/resumeRevisionSession'
export { finishRevisionSession } from './actions/finishRevisionSession'
export { findRevisionSessionForDocument } from './actions/findRevisionSessionForDocument'
export { getDocumentRevisionContext } from './queries/getDocumentRevisionContext'

export type { ModeSessionActionResult } from '@/features/learning-mode-runtime'
export type { DocumentRevisionContext } from './queries/getDocumentRevisionContext'
