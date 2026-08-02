// AI Learning Analysis Engine™ (UCE-5) — RESERVED personalization
// extension point, now shared with UCE-6 (Universal Learning Object™)
// and future engines. "Design extension points only... Do NOT implement
// personalization logic yet." Every field is optional and none are
// populated this sprint. Deliberately NOT a field on `LearningAnalysis`,
// the `UniversalLearningObject`, or any per-chunk/per-concept entry —
// personalization signals (age, class, exam type, reading speed, memory
// score, Mind Score™) are inherently PER-LEARNER, while those objects
// are document-level/shared — one serves every learner who studies that
// document. Embedding per-learner fields on shared state would either
// force one copy per learner (breaking "Reusable across all Learning
// Modes") or force mutating shared state per learner. Instead, a future
// personalization engine attaches this type EXTERNALLY, keyed by
// `(learnerId, documentId)` — a future separate join/table, never a
// field on any shared object. Same architectural pattern as UCE-4's
// `GraphAssessmentSignals`. No logic, no storage here — the shape and
// this reasoning are the whole deliverable.
//
// UCE-6 sprint note: `readingScore`, `focusScore`, and
// `learningPreferences` are additive fields this brief's own
// personalization list also named (Reading Score™, Focus Score™,
// Learning Preferences) that UCE-5's original version didn't have — a
// small, additive extension (same class of change as this arc's other
// additive type extensions), not a redesign. No existing field renamed
// or removed.
export type PersonalizationContext = {
  learnerId: string
  documentId: string
  // Future engine — the learner's real age.
  age?: number
  // Future engine — the learner's real class/grade level.
  classLevel?: string
  // Future engine — the real exam this learner is preparing for.
  examType?: string
  // Future engine — the learner's real profession/field.
  profession?: string
  // Future engine — the learner's real stated learning goal.
  learningGoal?: string
  // Future engine — the learner's real measured reading speed, words per minute.
  readingSpeedWpm?: number
  // Future engine — the learner's real measured memory score, 0-1.
  memoryScore?: number
  // Future engine — the learner's real Mind Score™, 0-1.
  mindScore?: number
  // Future engine — the learner's real Reading Score™, 0-1.
  readingScore?: number
  // Future engine — the learner's real Focus Score™, 0-1.
  focusScore?: number
  // Future engine — the learner's real stated learning preferences
  // (e.g. "visual", "prefers examples").
  learningPreferences?: readonly string[]
}
