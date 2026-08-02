import type { LearningMode } from '@/core/learning-mode-integration'

// Revision Mode™ — AI Learning Studio™ Sprint ALS-17. The sixth real,
// registrable Learning Mode™, built against the same locked Learning
// Mode Runtime Contract™ (LSE-5) every prior mode already proved out.
// Unlike every other mode added so far, this one needed no new
// `SessionType`/`LearningModeType` value or migration at all — `'revision'`
// was already a real value in both unions and in `learning_sessions`'s
// own original CHECK constraint from Sprint 1 (`session_type IN
// ('reading', 'memory', 'revision', 'research')`), simply never
// implemented until now.
//
// `supportedChunkStrategies` is `review-first` — the same strategy Memory
// Mode™ already uses for its own recall-oriented scheduling — plus
// `sequential` for a straightforward pass through the document. No new
// strategy invented for revision-specific reordering; the real,
// informational history summary this mode also surfaces
// (`getDocumentRevisionContext.ts`) is deliberately never used to filter
// or reorder chunks, per this sprint's own founder-confirmed scope — it
// only ever informs the learner, never the scheduling engine.
export const revisionLearningMode: LearningMode = {
  type: 'revision',
  capabilities: {
    sessionType: 'revision',
    supportedChunkStrategies: ['review-first', 'sequential'],
    supportsCheckpoints: true,
  },
}
