// The shared input every Chunk 2 analyzer reads — this feature's own
// lightweight view of "what has this learner engaged with," not an
// import of learning-intelligence's `LearningPlan` (that bridge is
// Chunk 4's explicit job). `studyModesUsed` is a plain string array
// here rather than learning-intelligence's `LearningObjectType`, for
// the same self-containment reason.
export type MentorActivitySnapshot = {
  learningProjectId: string
  conceptsEncountered: readonly string[]
  studyModesUsed: readonly string[]
  sessionCount: number
}
