import type { LearningMode } from '@/core/learning-mode-integration'

// Memory Mode™ — Sprint-1. The second real, registrable Learning Mode™,
// built against the same locked Learning Mode Runtime Contract™ (LSE-5)
// Quantum Speed Reading™ already proved out — reusing the exact same
// Shared Learning Runtime (`src/features/learning-mode-runtime/`), never
// a second runtime/session-engine/persistence/analytics/AI pipeline. No
// `adapter` is registered this sprint — Sprint-1 is engine-only (session
// lifecycle, navigation, progress, persistence); presentation-layer
// concerns remain reserved, unimplemented extension points on
// `RuntimeModeAdapter`, exactly as they were for QSR's own Sprint-1.
//
// `supportedChunkStrategies` favors recall-oriented scheduling
// (`review-first`, `adaptive-queue`) over QSR's linear-reading-first
// ordering, while still allowing `sequential` for a straightforward
// first pass — all three are real, already-existing LSE-2 strategies,
// never a new one invented for this mode.
export const memoryLearningMode: LearningMode = {
  type: 'memory',
  capabilities: {
    sessionType: 'memory',
    supportedChunkStrategies: ['review-first', 'adaptive-queue', 'sequential'],
    supportsCheckpoints: true,
  },
}
