// AI Mentor™ Sprint-1 — Foundation. A real, read-only aggregation of the
// learner's already-real progress across Reading, Memory, and Smart
// Notes, plus their real Learning Projects — never a new business-logic
// computation, just composing already-real data each mode's own prior
// sprints already built (Memory's own `computeMemoryLearningProfile`,
// Smart Notes' own `computeSmartNotesLearningProfile`, and the Shared
// Learning Runtime's own `listByLearner` for reading, which has no
// equivalent profile function to reuse).
//
// AI Mentor™ Sprint-3 amendment: the three `daysSinceLast*Session`
// fields were added, additively, to support real recommendations
// (`recommendMentorFocus.ts`) — `null`, honestly, when a learner has no
// real sessions of that mode yet, never a guessed "0 days." Still no
// AI-generated text anywhere in this type; every field is real,
// structural data.
//
// AI Mentor™ Sprint ALS-21 amendment — `activeDocument`. A production
// audit found AI Mentor™ never referenced any real document content in
// its own prompts, only aggregate counts — confirmed a deliberate
// original design choice (AI Mentor is learner-scoped, not document-
// scoped), but one worth closing partially: the learner's own most
// recently active document's real title and real section headings,
// reusing the exact same `loadUniversalLearningObject`/
// `listDocumentSectionHeadings` primitives MCQs™ already uses — no new
// AI pipeline, no new parsing. `null`, honestly, when the learner has no
// real sessions yet, or their most recent document's ULO can no longer
// be loaded.
export type MentorActiveDocumentContext = {
  // Production AI Cost Optimization — Task 7 (additive). The real
  // document id `resolveActiveDocumentContext` already resolves
  // internally but previously discarded — exposed here so
  // `sendMentorMessage.ts` can load this same document's real ULO once
  // more for `tryAnswerFromStoredKnowledge`'s retrieval check, without
  // `buildMentorSessionContext` itself growing a second responsibility.
  documentId: string
  title: string
  sectionHeadings: readonly string[]
}

export type MentorSessionContext = {
  learnerId: string
  learningProjectsCount: number
  readingSessionsCompleted: number
  memorySessionsCompleted: number
  memoryAverageConfidenceScore: number
  smartNotesSessionsCompleted: number
  documentsWithNotes: number
  daysSinceLastReadingSession: number | null
  daysSinceLastMemorySession: number | null
  daysSinceLastSmartNotesSession: number | null
  activeDocument: MentorActiveDocumentContext | null
}
