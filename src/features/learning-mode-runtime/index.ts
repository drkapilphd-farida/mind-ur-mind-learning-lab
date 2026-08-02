// Shared Learning Runtime — Memory Mode™ Sprint-1. The one real,
// mode-agnostic runtime/persistence/orchestration layer sitting between
// LSE-2/LSE-3/LSE-4/ULO and any individual Learning Mode's own feature
// (`quantum-speed-reading-runtime`, `memory-mode-runtime`, …). Extracted
// from Quantum Speed Reading™'s own Sprint-1 implementation once it
// became clear a second Learning Mode needed the exact same mechanics —
// no duplicate runtime, session engine, persistence, or AI pipeline.
export type { ModeChunkView, ModeSessionActionResult, ModeWorkspaceInitialState } from './types'

export { SessionIdSchema, ChunkStrategySchema } from './validation/schemas'

export { loadUniversalLearningObject } from './persistence/loadUniversalLearningObject'
export { saveUniversalLearningObject } from './persistence/saveUniversalLearningObject'
export { createSupabaseSessionPersistenceAdapter } from './persistence/createSupabaseSessionPersistenceAdapter'

export { applyModeSessionDecision } from './orchestration/applyModeSessionDecision'
export type { ModeSessionDecisionOutcome } from './orchestration/applyModeSessionDecision'
export { resolveCurrentChunkView } from './orchestration/resolveCurrentChunkView'

export { runModeSessionDecision, runModeSessionDecisionWithClient } from './actions/runModeSessionDecision'
export { findModeSessionForDocument } from './actions/findModeSessionForDocument'

export { formatElapsedDuration, formatEstimatedTimeRemaining } from './presentation/formatSessionDuration'

export { SessionProgressBar, SessionErrorBanner, SessionResumeBanner, SessionTimer, SessionNavigationControls } from './components'
