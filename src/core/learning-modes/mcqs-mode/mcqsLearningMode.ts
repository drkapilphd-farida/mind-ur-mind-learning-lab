import type { LearningMode } from '@/core/learning-mode-integration'

// MCQs™ — AI Learning Studio™ Sprint ALS-17. The fifth real, registrable
// Learning Mode™, built against the same locked Learning Mode Runtime
// Contract™ (LSE-5) every prior mode already proved out — reusing the
// exact same Shared Learning Runtime, never a second runtime/session-
// engine/persistence/AI pipeline. No `adapter` is registered — engine-
// only. Presentation (each real chunk becomes one real structural
// question) lives entirely in `src/features/mcqs-mode-runtime/`.
//
// `supportedChunkStrategies` is `sequential` only — questions are framed
// against the document's own real reading order (one question type asks
// "what comes after this section"), so an adaptively-reordered queue
// would make that question type incoherent.
export const mcqsLearningMode: LearningMode = {
  type: 'mcqs',
  capabilities: {
    sessionType: 'mcqs',
    supportedChunkStrategies: ['sequential'],
    supportsCheckpoints: true,
  },
}
