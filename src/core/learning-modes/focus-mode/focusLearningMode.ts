import type { LearningMode } from '@/core/learning-mode-integration'

// Focus Mode™ (Mini) — AI Learning Studio™ Sprint ALS-16. The fourth real,
// registrable Learning Mode™, built against the same locked Learning Mode
// Runtime Contract™ (LSE-5) Quantum Speed Reading™/Memory Mode™/Smart
// Notes™ already proved out — reusing the exact same Shared Learning
// Runtime, never a second runtime/session-engine/persistence/AI pipeline.
// No `adapter` is registered — engine-only (session lifecycle, navigation,
// progress, persistence); presentation-layer concerns (which of the three
// Focus variants is active) live entirely in `SessionSnapshot.method`, the
// same real, opaque, mode-defined field ALS-15 already built for Memory
// Mode's own six methods — reused verbatim, not reinvented.
//
// `supportedChunkStrategies` is deliberately the smallest of any mode:
// Focus Mode's whole premise is uninterrupted, undistracted progress
// through the document in its own natural order, so only `sequential` is
// offered — no priority/dependency/review/adaptive reordering, which
// would work against the "deep focus" premise this mode exists for.
export const focusLearningMode: LearningMode = {
  type: 'focus-mode',
  capabilities: {
    sessionType: 'focus',
    supportedChunkStrategies: ['sequential'],
    supportsCheckpoints: true,
  },
}
