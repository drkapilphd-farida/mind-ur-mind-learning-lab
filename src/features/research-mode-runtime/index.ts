// Research Mode™ — Production AI Integration (ALS-24) — engine only. No
// Personalized Research™, no Adaptive Learning™, no AI Brain Profiling™.
// Session lifecycle, navigation, progress, and persistence only, built
// entirely on the Shared Learning Runtime
// (`src/features/learning-mode-runtime/`), the same one every other real
// Learning Mode uses. No duplicate runtime, session engine, persistence,
// or AI pipeline — "deep concept exploration" comes entirely from real
// `chunk.enrichment` data UCE-3B already produced during processing, read
// through the same shared `ModeChunkView`, never a new AI call from this
// mode itself.
export { startResearchSession } from './actions/startResearchSession'
export { continueResearchSession } from './actions/continueResearchSession'
export { nextResearchChunk } from './actions/nextResearchChunk'
export { previousResearchChunk } from './actions/previousResearchChunk'
export { pauseResearchSession } from './actions/pauseResearchSession'
export { resumeResearchSession } from './actions/resumeResearchSession'
export { finishResearchSession } from './actions/finishResearchSession'
export { findResearchSessionForDocument } from './actions/findResearchSessionForDocument'

export type { ModeSessionActionResult } from '@/features/learning-mode-runtime'
