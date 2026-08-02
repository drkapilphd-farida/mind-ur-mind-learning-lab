import type { LearningMode } from '@/core/learning-mode-integration'

// Research Mode™ — Production AI Integration (ALS-24). The tenth real,
// registrable Learning Mode™, built against the same locked Learning
// Mode Runtime Contract™ (LSE-5) every prior mode already proved out.
// Like Revision Mode™ before it, this needed no new `SessionType`/
// `LearningModeType` value or migration at all — `'research'` was
// already a real value in both unions and in `learning_sessions`'s own
// original CHECK constraint from Sprint 1 (`session_type IN
// ('reading', 'memory', 'revision', 'research')`), simply never
// implemented until now.
//
// `supportedChunkStrategies` is `dependency-first` — a genuine fit for
// "deep concept exploration" (walking concepts in the order they build on
// each other, per the real `builds-upon` edges the knowledge graph now
// produces once a document's chunks are enriched) — plus `sequential` for
// a straightforward pass through the document when no such ordering
// exists yet (a document whose enrichment failed or was skipped).
export const researchLearningMode: LearningMode = {
  type: 'research',
  capabilities: {
    sessionType: 'research',
    supportedChunkStrategies: ['dependency-first', 'sequential'],
    supportsCheckpoints: true,
  },
}
