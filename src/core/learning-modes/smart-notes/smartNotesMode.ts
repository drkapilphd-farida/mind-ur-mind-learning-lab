import type { LearningMode } from '@/core/learning-mode-integration'

// Smart Notes™ — Sprint-1. The third real, registrable Learning Mode™,
// built against the same locked Learning Mode Runtime Contract™ (LSE-5)
// Quantum Speed Reading™ and Memory Mode™ already proved out — reusing
// the exact same Shared Learning Runtime
// (`src/features/learning-mode-runtime/`), never a second runtime/
// session-engine/persistence/analytics/AI pipeline. No `adapter` is
// registered this sprint — Sprint-1 is engine-only; presentation-layer
// concerns remain reserved, unimplemented extension points on
// `RuntimeModeAdapter`, exactly as they were for QSR's and Memory's own
// Sprint-1.
//
// `sessionType: 'smart-notes'` is a genuine sixth `SessionType` value
// (ULO's own `ExperienceIntelligence.ts`), added this sprint alongside a
// matching widening of the `learning_sessions` CHECK constraint
// (20260718000001_widen_learning_sessions_smart_notes.sql) — Smart Notes
// is its own real production module and must not be mislabeled as
// 'research' or 'revision'.
//
// `supportedChunkStrategies` favors working through a document in its
// own real order (`sequential`) or by real importance
// (`priority-first`)/real prerequisite order (`dependency-first`) — all
// three already-existing LSE-2 strategies, never a new one invented for
// this mode. `review-first`/`adaptive-queue` stay Memory Mode's own
// primary strategies, not duplicated here.
export const smartNotesMode: LearningMode = {
  type: 'smart-notes',
  capabilities: {
    sessionType: 'smart-notes',
    supportedChunkStrategies: ['sequential', 'priority-first', 'dependency-first'],
    supportsCheckpoints: true,
  },
}
